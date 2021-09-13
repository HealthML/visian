import { getMultiparts } from "@visian/utils";

// See http://dicom.nema.org/dicom/2013/output/chtml/part18/sect_6.7.html
const studyFields = {
  StudyDate: "00080020",
  StudyTime: "00080030",
  AccessionNumber: "00080050",
  ModalitiesInStudy: "00080061",
  ReferringPhysicianName: "00080090",
  PatientName: "00100010",
  PatientID: "00100020",
  StudyInstanceUID: "0020000D",
  StudyID: "00200010",
};
export interface Study {
  StudyInstanceUID: string;
  PatientName?: string;
  PatientID?: string;
}

const seriesFields = {
  Modality: "00080060",
  SeriesInstanceUID: "0020000E",
  SeriesNumber: "00200011",
  PerformedProcedureStepStartDate: "00400244",
  PerformedProcedureStepStartTime: "00400245",
  RequestAttributeSequence: "00400275",
  ">ScheduledProcedureStepID": "00400009",
  ">RequestedProcedureID": "00401001",
};
export interface Series {
  SeriesInstanceUID: string;
  Modality?: string;
  SeriesNumber?: number;
}

const instanceFields = {
  SOPClassUID: "00080016",
  SOPInstanceUID: "00080018",
  InstanceNumber: "00200013",
};
export interface Instance {
  InstanceNumber?: number;
}

export class DICOMWebServer {
  public static async connect(url: string) {
    const server = new DICOMWebServer(url);
    await server.runAutoconfig();
    return server;
  }

  public readonly url;
  public useSeparateEndpoints = false;
  public readonly qidoHeaders = { Accept: "application/dicom+json" };
  public readonly wadoHeaders = {
    Accept: 'multipart/related; type="application/dicom"; transfer-syntax=*',
  };

  constructor(url: string) {
    this.url = url.replace(/\/$/, "");
  }

  public async runAutoconfig() {
    if (
      (
        await fetch(`${this.url}/studies`, {
          headers: this.qidoHeaders,
        })
      ).status === 200
    ) {
      return;
    }

    if (
      (
        await fetch(`${this.url}/qido/studies`, {
          headers: this.qidoHeaders,
        })
      ).status === 200
    ) {
      this.useSeparateEndpoints = true;
    }
  }

  protected getEndpoint(operation: string) {
    return this.useSeparateEndpoints ? `${this.url}/${operation}` : this.url;
  }

  public async searchStudies(): Promise<Study[]> {
    const response = await fetch(
      `${this.getEndpoint("qido")}/studies?includefield=all`,
      {
        headers: this.qidoHeaders,
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await response.json()).map((study: any) => ({
      StudyInstanceUID: study[studyFields.StudyInstanceUID].Value[0],
      PatientName: study[studyFields.PatientName]?.Value?.[0]?.Alphabetic,
      PatientID: study[studyFields.PatientID]?.Value?.[0],
    }));
  }

  public async searchSeries(study: string): Promise<Series[]> {
    const response = await fetch(
      `${this.getEndpoint("qido")}/studies/${study}/series?includefield=all`,
      { headers: this.qidoHeaders },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await response.json()).map((series: any) => ({
      SeriesInstanceUID: series[seriesFields.SeriesInstanceUID].Value[0],
      Modality: series[seriesFields.Modality]?.Value?.[0],
      SeriesNumber: series[seriesFields.SeriesNumber]?.Value?.[0],
    }));
  }

  public async searchInstances(
    study: string,
    series: string,
  ): Promise<Instance[]> {
    const response = await fetch(
      `${this.getEndpoint(
        "qido",
      )}/studies/${study}/series/${series}/instances?includefield=all`,
      { headers: this.qidoHeaders },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await response.json()).map((instance: any) => ({
      InstanceNumber: instance[instanceFields.InstanceNumber]?.Value?.[0],
    }));
  }

  public async retrieveSeries(study: string, series: string) {
    const response = await fetch(
      `${this.getEndpoint("wado")}/studies/${study}/series/${series}`,
      { headers: this.wadoHeaders },
    );

    return getMultiparts(
      new Uint8Array(await response.arrayBuffer()),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      response.headers
        .get("Content-Type")!
        .split("boundary=")[1]
        .replace(/"/g, ""),
    ).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (section: any, index) =>
        new File([section.file], section.fileName || `${index}.dcm`),
    );
  }
}
