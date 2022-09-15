import { IDocument } from "@visian/ui-shared";
import {
  createFileFromBase64,
  deidentifyDicom,
  ISerializable,
  Zip,
} from "@visian/utils";
import axios from "axios";
import dicomParser from "dicom-parser";
import { action, makeObservable, observable, toJS } from "mobx";
import path from "path";

import {
  FLOY_API_ROOT,
  FLOY_INFERENCE_ENDPOINTS,
  FLOY_MAIL_KEY,
  FLOY_TOKEN_KEY,
} from "../../constants";

// TODO: Add all supported models
export type FloyDemoModelKind = "MR_L-SPINE" | "MR_SPINE";

export interface FloyDemoSnapshot {
  seriesZip?: File;
  inferenceResults?: { [key: string]: unknown }[];
  selectableModels?: FloyDemoModelKind[];
  selectedModel?: FloyDemoModelKind;
}

const deidentifiedElements = [
  "00101081",
  "00403001",
  "00102160",
  "00080081",
  "00081040",
  "00080080",
  "00101080",
  "00081060",
  "00401010",
  "00102180",
  "00081070",
  "00101001",
  "00101040",
  "00100030",
  "00101005",
  "00100032",
  "00104000",
  "00101060",
  "00100010",
  "001021F0",
  "00380500",
  "00102154",
  "00401004",
  "00400243",
  "00400242",
  "00081050",
  "00081048",
  "00080090",
  "00102152",
  "00401001",
  "00401005",
  "00321032",
  "00400006",
  "00081010",
  "00324000",
].map((element) => `x${element.toLowerCase()}`);

export class FloyDemoController implements ISerializable<FloyDemoSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  protected seriesZip?: File;
  public inferenceResults?: { [key: string]: unknown }[];

  public selectableModels: FloyDemoModelKind[] = ["MR_SPINE"];
  public selectedModel: FloyDemoModelKind = "MR_SPINE";

  constructor(protected document: IDocument) {
    makeObservable<
      this,
      | "seriesZip"
      | "setSeriesZip"
      | "setInferenceResults"
      | "setSelectableModels"
    >(this, {
      seriesZip: observable,
      inferenceResults: observable,
      selectableModels: observable,
      selectedModel: observable,

      setSeriesZip: action,
      setInferenceResults: action,
      setSelectableModels: action,
      setSelectedModel: action,
    });
  }

  public get hasDemoCandidate(): boolean {
    return Boolean(this.seriesZip);
  }

  protected setSelectableModels(
    value: FloyDemoModelKind[] = ["MR_L-SPINE"],
  ): void {
    this.selectableModels = value;
    if (value[0]) [this.selectedModel] = value;
  }

  public setSelectedModel = (value: FloyDemoModelKind = "MR_SPINE"): void => {
    this.selectedModel = value;
  };

  // TODO: This method could potentially be replaced by extracting the
  // selection logic for each model to `getSelectableModels` and rejecting all
  // series that do not yield at least one valid model identifier
  public async isDemoCandidate(series: File | File[]): Promise<boolean> {
    const firstFile = Array.isArray(series) ? series[0] : series;

    // Only accept DICOM
    if (
      path.extname(firstFile.name) !== ".dcm" &&
      path.extname(firstFile.name) !== ".DCM" &&
      path.extname(firstFile.name) !== ""
    ) {
      return false;
    }

    // Filter series
    try {
      const dataSet = dicomParser.parseDicom(
        new Uint8Array(await firstFile.arrayBuffer()),
      );
      console.log(
        "Filtered, if not MR:",
        dataSet.string("x00080060"),
        "(",
        dataSet.string("x00080060") !== "MR",
        ")",
      );
      console.log(
        "Filtered, if km:",
        dataSet.string("x0008103e").toLowerCase(),
        "(",
        dataSet.string("x0008103e").toLowerCase().includes("km"),
        ")",
      );
      console.log(
        "Filtered, if flair:",
        dataSet.string("x0008103e").toLowerCase(),
        "(",
        dataSet.string("x0008103e").toLowerCase().includes("flair"),
        ")",
      );
      console.log(
        "Filtered, if water:",
        dataSet.string("x0008103e").toLowerCase(),
        "(",
        dataSet.string("x0008103e").toLowerCase().includes("water"),
        ")",
      );
      console.log(
        "Filtered, if fat:",
        dataSet.string("x0008103e").toLowerCase(),
        "(",
        dataSet.string("x0008103e").toLowerCase().includes("fat"),
        ")",
      );
      console.log(
        "Filtered, if inphase:",
        dataSet.string("x0008103e").toLowerCase(),
        "(",
        dataSet.string("x0008103e").toLowerCase().includes("inphase"),
        ")",
      );
      console.log(
        "Filtered, if not sag:",
        dataSet.string("x0008103e").toLowerCase(),
        "(",
        !dataSet.string("x0008103e").toLowerCase().includes("sag"),
        ")",
      );
      console.log(
        "Filtered, if not contains t1:",
        dataSet.string("x0008103e").toLowerCase(),
        "(",
        !dataSet.string("x0008103e").toLowerCase().includes("t1"),
        ")",
      );
      console.log(
        "Filtered, if floy:", // to filter floy result slices
        dataSet.string("x00080070").toLowerCase(),
        "(",
        dataSet.string("x00080070").toLowerCase().includes("floy"),
        ")",
      );
      if (
        dataSet.string("x00080060") !== "MR" ||
        dataSet.string("x0008103e").toLowerCase().includes("km") ||
        dataSet.string("x0008103e").toLowerCase().includes("flair") ||
        dataSet.string("x0008103e").toLowerCase().includes("water") ||
        dataSet.string("x0008103e").toLowerCase().includes("fat") ||
        dataSet.string("x0008103e").toLowerCase().includes("inphase") ||
        !dataSet.string("x0008103e").toLowerCase().includes("sag") ||
        !dataSet.string("x0008103e").toLowerCase().includes("t1") ||
        dataSet.string("x00080070").toLowerCase().includes("floy")
        // parsedDicom.string("x00180015") !== "LSPINE" ||
        // eslint-disable-next-line max-len
        // Alternative: https://stackoverflow.com/questions/34782409/understanding-dicom-image-attributes-to-get-axial-coronal-sagittal-cuts
      ) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }

  public async getSelectableModels(
    series: File | File[] | undefined,
  ): Promise<FloyDemoModelKind[]> {
    const selectableModels: FloyDemoModelKind[] = [];

    if (!series) return selectableModels;
    const firstFile = Array.isArray(series) ? series[0] : series;

    // Only accept DICOM
    if (
      path.extname(firstFile.name) !== ".dcm" &&
      path.extname(firstFile.name) !== ".DCM" &&
      path.extname(firstFile.name) !== ""
    ) {
      return selectableModels;
    }

    // Filter series
    try {
      const dataSet = dicomParser.parseDicom(
        new Uint8Array(await firstFile.arrayBuffer()),
      );

      // TODO: Implement model recommendation logic
      // The first model pushed will be the default selection
      if (dataSet.string("x00080060") === "MR") {
        selectableModels.push("MR_L-SPINE");
      }
      if (dataSet.string("x00080060") === "MR") {
        selectableModels.push("MR_SPINE");
      }
      // if (dataSet.string("x00080060") === "CT") {
      //   selectableModels.push("CT_SPINE");
      // }
    } catch {
      // Intentionally left blank
    }
    return selectableModels;
  }

  public async prepareSeriesZip(
    series?: File | File[],
    name?: string,
  ): Promise<File | undefined> {
    if (!series) return;

    const firstFile = Array.isArray(series) ? series[0] : series;

    // Prepare zip
    const zip = new Zip();
    (
      await Promise.all(
        (Array.isArray(series) ? series : [series])
          .filter((file) => Boolean(file))
          .map((file) => deidentifyDicom(file, deidentifiedElements)),
      )
    ).forEach((file) => {
      zip.setFile(`${name || firstFile.name}/${file.name}`, file);
    });

    return new File([await zip.toBlob()], `${name || firstFile.name}.zip`);
  }

  protected setSeriesZip(value?: File): void {
    this.seriesZip = value;
  }

  public async setDemoCandidate(
    series?: File | File[],
    name?: string,
  ): Promise<void> {
    const zip = await this.prepareSeriesZip(series, name);
    if (!zip) return this.setSeriesZip();

    this.setSeriesZip(zip);
    this.setSelectableModels(await this.getSelectableModels(series));

    // DEBUG
    // FileSaver.saveAs(await zip.toBlob(), `${name || firstFile.name}.zip`);
  }

  public setInferenceResults(value?: { [key: string]: unknown }[]) {
    this.inferenceResults = value;
  }

  public runInferencing = async (): Promise<void> => {
    if (!this.seriesZip) return;
    await this.log();

    const FLOY_INFERENCE_ENDPOINT: any[] = [];
    const formData = new FormData();
    formData.append("seriesZIP", this.seriesZip);
    // formData.append("studyZIP", this.seriesZip);
    formData.append("model", this.selectedModel);
    formData.append("tokenStr", localStorage.getItem(FLOY_TOKEN_KEY) || "");

    if (this.selectedModel === "MR_L-SPINE") {
      FLOY_INFERENCE_ENDPOINT.push(FLOY_INFERENCE_ENDPOINTS[0]);
    } else if (this.selectedModel === "MR_SPINE") {
      FLOY_INFERENCE_ENDPOINT.push(FLOY_INFERENCE_ENDPOINTS[1]);
    } else if (this.selectedModel === "CT_SPINE") {
      FLOY_INFERENCE_ENDPOINT.push(FLOY_INFERENCE_ENDPOINTS[2]);
    } else {
      console.log("ERROR: Model not found");
    }

    console.log("selectedModel: ", this.selectedModel);
    console.log("FLOY_INFERENCE_ENDPOINT: ", FLOY_INFERENCE_ENDPOINT[0]);

    // demo.floy.com
    this.setInferenceResults(
      await Promise.all(
        FLOY_INFERENCE_ENDPOINT.map(async (endpoint) => {
          const data = await (
            await fetch(endpoint, {
              method: "POST",
              body: formData,
            })
          ).json();

          if (data.segmentationMasksNIFTI) {
            try {
              await this.document.importFiles(
                createFileFromBase64(
                  "segmentation.nii",
                  data.segmentationMasksNIFTI,
                ),
                "Bounding Boxen",
                true,
              );
            } catch {
              /* Intentionally left blank */
            }
          }
          return data;
        }),
      ),
    );
  };

  // API: OTC Upload & Download
  public getSignedURLs = async (
    fileNameKey: string,
    getSignedUploadURL: boolean,
    getSignedDownloadURL: boolean,
  ): Promise<string> => {
    const token = localStorage.getItem(FLOY_TOKEN_KEY);
    if (!token) throw new Error();
    const response = await axios.request({
      method: "POST",
      url: `${FLOY_API_ROOT}/upload/${token}/infer`,
      data: { fileNameKey, getSignedUploadURL, getSignedDownloadURL },
    });
    return response.data;
  };

  // API: OTC Download
  public getSignedDownloadURL = async (
    fileNameKey: string,
    tokenString: string,
  ): Promise<string> => {
    // No need for token on download:
    // const token = localStorage.getItem(FLOY_TOKEN_KEY);
    // if (!token) throw new Error();
    const response = await axios.request({
      method: "POST",
      url: `${FLOY_API_ROOT}/download/${tokenString}/infer`,
      data: { fileNameKey },
    });
    return response.data;
  };

  // API: copy object
  public copyObject = async (
    sourceKey: string,
    destinationKey: string,
  ): Promise<string> => {
    const token = localStorage.getItem(FLOY_TOKEN_KEY);
    if (!token) throw new Error();
    const response = await axios.request({
      method: "POST",
      url: `${FLOY_API_ROOT}/copy/${token}/infer`,
      data: { sourceKey, destinationKey },
    });
    return response.data;
  };

  // demo.floy.com (Valohai Call)
  public runInferencingNew = async (model: string): Promise<void> => {
    console.log("model: ", model);

    if (!this.seriesZip) return;
    await this.log();

    // Generate .zip filename:
    const zipFile = this.seriesZip;
    const randomID = parseInt((Math.random() * 1000000000000000).toString());
    const fileNameKey = `${randomID}.zip`;
    const fileNameKeyReadable = `${localStorage.getItem(
      FLOY_TOKEN_KEY,
    )}-${randomID}-${zipFile?.name.slice(0, -4)}-series.zip`;

    // Rename file to be uploaded:
    Object.defineProperty(zipFile, "name", {
      writable: true,
      value: fileNameKey,
    });

    // Call Floy-API to generate signedURLs to OTC OBS:
    const response = await this.getSignedURLs(
      `raw-data/demo-floy-com-production/${fileNameKey}`,
      true,
      true,
    );
    const signedUploadURL = response[0];
    const signedDownloadURL = response[1];

    // Upload file to OTC OBS (demo-floy-com-production):
    await axios.request({
      headers: { "Content-Type": "application/zip" },
      method: "PUT",
      url: signedUploadURL,
      data: zipFile,
    });

    // Call Floy-API to copy just uploaded file from 'demo-floy-com-production' to 'demo-floy-com'
    await this.copyObject(
      `raw-data/demo-floy-com-production/${fileNameKey}`,
      `raw-data/demo-floy-com/${fileNameKeyReadable}`,
    );

    // Call Valohai API with signedDownloadURL
    const token = localStorage.getItem(FLOY_TOKEN_KEY);
    if (!token) throw new Error();
    return axios.post(`${FLOY_API_ROOT}/batch/${token}/infer`, {
      signedDownloadURL,
      model,
    });
  };

  // demo.floy.com/upload (Valohai Call)
  public runBulkInferencing = async (
    data: string[], // signedDownloadURLs
    email: string,
  ): Promise<void> => {
    const token = localStorage.getItem(FLOY_TOKEN_KEY);
    if (!token) throw new Error();
    return axios.post(`${FLOY_API_ROOT}/batches/${token}/infer`, {
      email,
      data,
    });
  };

  // Token Management
  public hasToken(): boolean {
    return Boolean(localStorage.getItem(FLOY_TOKEN_KEY));
  }

  public hasEmail(): boolean {
    return Boolean(localStorage.getItem(FLOY_MAIL_KEY));
  }

  public async activateToken(token?: string) {
    const tokenWithDefault = token || localStorage.getItem(FLOY_TOKEN_KEY);
    if (!tokenWithDefault) throw new Error();

    await axios.get(`${FLOY_API_ROOT}/tokens/${tokenWithDefault}`);
    localStorage.setItem(FLOY_TOKEN_KEY, tokenWithDefault);
  }

  public clearToken() {
    localStorage.removeItem(FLOY_TOKEN_KEY);
  }

  public consent() {
    const token = localStorage.getItem(FLOY_TOKEN_KEY);
    if (!token) throw new Error();

    return axios.post(`${FLOY_API_ROOT}/tokens/${token}/consent`);
  }

  public log() {
    const token = localStorage.getItem(FLOY_TOKEN_KEY);
    if (!token) throw new Error();

    return axios.post(`${FLOY_API_ROOT}/tokens/${token}`);
  }

  // Serialization
  public toJSON(): FloyDemoSnapshot {
    return {
      seriesZip: this.seriesZip,
      inferenceResults: toJS(this.inferenceResults),
      selectableModels: toJS(this.selectableModels),
      selectedModel: this.selectedModel,
    };
  }

  public async applySnapshot(
    snapshot: Partial<FloyDemoSnapshot>,
  ): Promise<void> {
    this.setSeriesZip(snapshot.seriesZip);
    this.setInferenceResults(snapshot.inferenceResults);
    this.setSelectableModels(snapshot.selectableModels);
    this.setSelectedModel(snapshot.selectedModel);
  }
}
