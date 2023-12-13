export interface WHOAnnotationDataSnapshot {
  annotationDataUUID: string;
  data: string;
}

export class WHOAnnotationData {
  public annotationDataUUID: string;
  public data: string;

  // TODO: Properly type API response data
  constructor(annotationData: any) {
    this.annotationDataUUID = annotationData.annotationDataUUID;
    this.data = annotationData.data;
  }

  public toJSON(): WHOAnnotationDataSnapshot {
    return {
      annotationDataUUID: this.annotationDataUUID,
      data: this.data,
    };
  }
}
