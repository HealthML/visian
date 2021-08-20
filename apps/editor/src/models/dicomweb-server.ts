// See http://dicom.nema.org/dicom/2013/output/chtml/part18/sect_6.7.htmldicom wa

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
  public readonly url;

  constructor(url: string) {
    this.url = url.replace(/\/$/, "");
  }

  public async readStudies(): Promise<Study[]> {
    const studies = await fetch(`${this.url}/studies?includefield=all`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await studies.json()).map((study: any) => ({
      StudyInstanceUID: study[studyFields.StudyInstanceUID].Value[0],
      PatientName: study[studyFields.PatientName]?.Value?.[0]?.Alphabetic,
      PatientID: study[studyFields.PatientID]?.Value?.[0],
    }));
  }

  public async readSeries(study: string): Promise<Series[]> {
    const studies = await fetch(
      `${this.url}/studies/${study}/series?includefield=all`,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await studies.json()).map((series: any) => ({
      SeriesInstanceUID: series[seriesFields.SeriesInstanceUID].Value[0],
      Modality: series[seriesFields.Modality]?.Value?.[0],
      SeriesNumber: series[seriesFields.SeriesNumber]?.Value?.[0],
    }));
  }

  public async readInstances(
    study: string,
    series: string,
  ): Promise<Instance[]> {
    const loadedSeries = await fetch(
      `${this.url}/studies/${study}/series/${series}/instances?includefield=all`,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await loadedSeries.json()).map((instance: any) => ({
      InstanceNumber: instance[instanceFields.InstanceNumber]?.Value?.[0],
    }));
  }
}
