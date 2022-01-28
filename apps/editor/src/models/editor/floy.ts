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

export interface FloyDemoSnapshot {
  seriesZip?: File;
  inferenceResults?: { [key: string]: unknown }[];
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

  constructor(protected document: IDocument) {
    makeObservable<this, "seriesZip" | "setSeriesZip" | "setInferenceResults">(
      this,
      {
        seriesZip: observable,
        inferenceResults: observable,
        setSeriesZip: action,
        setInferenceResults: action,
      },
    );
  }

  public get hasDemoCandidate(): boolean {
    return Boolean(this.seriesZip);
  }

  public async isDemoCandidate(series: File | File[]): Promise<boolean> {
    const firstFile = Array.isArray(series) ? series[0] : series;

    // Only accept DICOM
    if (
      path.extname(firstFile.name) !== ".dcm" &&
      path.extname(firstFile.name) !== ""
    ) {
      return false;
    }

    // Filter series
    try {
      const dataSet = dicomParser.parseDicom(
        new Uint8Array(await firstFile.arrayBuffer()),
      );
      if (
        dataSet.string("x00080060") !== "MR" ||
        dataSet.string("x0008103e").toLowerCase().includes("km") ||
        dataSet.string("x0008103e").toLowerCase().includes("flair") ||
        dataSet.string("x0008103e").toLowerCase().includes("water") ||
        dataSet.string("x0008103e").toLowerCase().includes("fat") ||
        dataSet.string("x0008103e").toLowerCase().includes("inphase") ||
        !dataSet.string("x0008103e").toLowerCase().includes("sag") ||
        !dataSet.string("x0008103e").toLowerCase().includes("t1")
        // parsedDicom.string("x00180015") !== "LSPINE" ||
        // eslint-disable-next-line max-len
        // Alternative: https://stackoverflow.com/questions/34782409/understanding-dicom-image-attributes-to-get-axial-coronal-sagittal-cuts
        // TODO: No contrast agent
      ) {
        console.log(
          "Filtered, if not MR: ",
          dataSet.string("x00080060") !== "MR",
        );
        console.log(
          "Filtered, if contains km: ",
          dataSet.string("x0008103e").toLowerCase().includes("km"),
        );
        console.log(
          "Filtered, if contains flair: ",
          dataSet.string("x0008103e").toLowerCase().includes("flair"),
        );
        console.log(
          "Filtered, if contains water: ",
          dataSet.string("x0008103e").toLowerCase().includes("water"),
        );
        console.log(
          "Filtered, if caintains fat: ",
          dataSet.string("x0008103e").toLowerCase().includes("fat"),
        );
        console.log(
          "Filtered, if contains inphase: ",
          dataSet.string("x0008103e").toLowerCase().includes("inphase"),
        );
        console.log(
          "Filtered, if not contains sag: ",
          dataSet.string("x0008103e").toLowerCase().includes("sag"),
        );
        console.log(
          "Filtered, if not contains t1: ",
          dataSet.string("x0008103e").toLowerCase().includes("t1"),
        );
        return false;
      }
    } catch {
      return false;
    }

    return true;
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

    // DEBUG
    // FileSaver.saveAs(await zip.toBlob(), `${name || firstFile.name}.zip`);
  }

  protected setInferenceResults(value?: { [key: string]: unknown }[]) {
    this.inferenceResults = value;
  }

  public runInferencing = async (): Promise<void> => {
    if (!this.seriesZip) return;
    await this.log();

    const formData = new FormData();
    formData.append("seriesZIP", this.seriesZip);
    formData.append("studyZIP", this.seriesZip);
    formData.append("tokenStr", localStorage.getItem(FLOY_TOKEN_KEY) || "");

    // demo.floy.com
    this.setInferenceResults(
      await Promise.all(
        FLOY_INFERENCE_ENDPOINTS.map(async (endpoint) => {
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

  // demo.floy.com/upload
  public runBulkInferencing = async (
    data: string[],
    email: string,
  ): Promise<void> => {
    const token = localStorage.getItem(FLOY_TOKEN_KEY);
    if (!token) throw new Error();

    // Log & execute inference run on batch
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
    };
  }

  public async applySnapshot(
    snapshot: Partial<FloyDemoSnapshot>,
  ): Promise<void> {
    this.setSeriesZip(snapshot.seriesZip);
    this.setInferenceResults(snapshot.inferenceResults);
  }
}
