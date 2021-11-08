import { IDocument } from "@visian/ui-shared";
import { deidentifyDicom, ISerializable, Zip } from "@visian/utils";
import dicomParser from "dicom-parser";
import { action, makeObservable, observable, toJS } from "mobx";
import path from "path";

import { FLOY_INFERENCE_ENDPOINTS } from "../../constants";

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
        // parsedDicom.string("x00180015") !== "LSPINE" ||
        // !parsedDicom.string("x0008103e").toLowerCase().includes("t1") ||
        // eslint-disable-next-line max-len
        // Alternative: https://stackoverflow.com/questions/34782409/understanding-dicom-image-attributes-to-get-axial-coronal-sagittal-cuts
        !dataSet.string("x0008103e").toLowerCase().includes("sag")
        // TODO: No contrast agent
      ) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }

  protected setSeriesZip(value?: File): void {
    this.seriesZip = value;
  }

  public async setDemoCandidate(
    series?: File | File[],
    name?: string,
  ): Promise<void> {
    if (!series) return this.setSeriesZip();

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

    this.setSeriesZip(
      new File([await zip.toBlob()], `${name || firstFile.name}.zip`),
    );

    // DEBUG
    // FileSaver.saveAs(await zip.toBlob(), `${name || firstFile.name}.zip`);
  }

  protected setInferenceResults(value?: { [key: string]: unknown }[]) {
    this.inferenceResults = value;
  }

  public runInferencing = async (): Promise<void> => {
    if (!this.seriesZip) return;

    const formData = new FormData();
    formData.append("seriesZIP", this.seriesZip);

    this.setInferenceResults(
      await Promise.all(
        FLOY_INFERENCE_ENDPOINTS.map(async (endpoint) =>
          (
            await fetch(endpoint, {
              method: "POST",
              body: formData,
            })
          ).json(),
        ),
      ),
    );
  };

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
