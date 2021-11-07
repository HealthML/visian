import { IDocument } from "@visian/ui-shared";
import { ISerializable, Zip } from "@visian/utils";
import dicomParser from "dicom-parser";
import { action, makeObservable, observable } from "mobx";
import path from "path";

import { FLOY_INFERENCE_API } from "../../constants";

export interface FloyDemoSnapshot {
  seriesZip?: File;
}

export class FloyDemoController implements ISerializable<FloyDemoSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  protected seriesZip?: File;

  constructor(protected document: IDocument) {
    makeObservable<this, "seriesZip" | "setSeriesZip">(this, {
      seriesZip: observable,
      setSeriesZip: action,
    });
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
      const parsedDicom = dicomParser.parseDicom(
        new Uint8Array(await firstFile.arrayBuffer()),
      );
      if (
        parsedDicom.string("x00080060") !== "MR" ||
        parsedDicom.string("x00180015") !== "LSPINE" ||
        !parsedDicom.string("x0008103e").toLowerCase().includes("t1") ||
        // eslint-disable-next-line max-len
        // Alternative: https://stackoverflow.com/questions/34782409/understanding-dicom-image-attributes-to-get-axial-coronal-sagittal-cuts
        !parsedDicom.string("x0008103e").toLowerCase().includes("sag")
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
    (Array.isArray(series) ? series : [series]).forEach((file) => {
      if (!file) return;
      zip.setFile(`${name || firstFile.name}/${file.name}`, file);
    });

    this.setSeriesZip(
      new File([await zip.toBlob()], `${name || firstFile.name}.zip`),
    );

    // DEBUG
    // FileSaver.saveAs(await zip.toBlob(), `${name || firstFile.name}.zip`);
  }

  public runInferencing = async (): Promise<void> => {
    if (!this.seriesZip) return;

    const formData = new FormData();
    formData.append("seriesZIP", this.seriesZip);
    await fetch(FLOY_INFERENCE_API, {
      method: "POST",
      body: formData,
    });
  };

  public toJSON(): FloyDemoSnapshot {
    return {
      seriesZip: this.seriesZip,
    };
  }

  public async applySnapshot(
    snapshot: Partial<FloyDemoSnapshot>,
  ): Promise<void> {
    this.setSeriesZip(snapshot.seriesZip);
  }
}
