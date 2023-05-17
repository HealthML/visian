export interface AnnotationDataSnapshotWHO {
  annotationDataUUID: string;
  data: string;
}

export class AnnotationDataWHO {
  public annotationDataUUID: string;
  public data: string;
  public correspondingLayerId = "";

  // TODO: Properly type API response data
  constructor(annotationData: any) {
    this.annotationDataUUID = annotationData.annotationDataUUID;
    this.data = annotationData.data;
  }

  public toJSON(): AnnotationDataSnapshotWHO {
    return {
      annotationDataUUID: this.annotationDataUUID,
      data: this.data,
    };
  }
}
