export interface AnnotationDataSnapshot {
  annotationDataUUID: string;
  data: string;
}

export class AnnotationData {
  public annotationDataUUID: string;
  public data: string;

  constructor(annotationData: any) {
    this.annotationDataUUID = annotationData.annotationDataUUID;
    this.data = annotationData.data;
  }

  public toJSON(): AnnotationDataSnapshot {
    return {
      annotationDataUUID: this.annotationDataUUID,
      data: this.data,
    };
  }
}
