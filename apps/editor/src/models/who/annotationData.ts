import { AnnotationDataSnapshot, IAnnotationData } from "@visian/ui-shared";

export class AnnotationData implements IAnnotationData {
  public annotationDataUUID: string;
  public data: string;
  public correspondingLayerId = "";

  // TODO: Properly type API response data
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
