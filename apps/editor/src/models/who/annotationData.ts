import { AnnotationDataSnapshot, IAnnotationData } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";

export class AnnotationData implements IAnnotationData {
  public annotationDataUUID: string;
  public data: string;
  public correspondingLayerId = "";

  // TODO: Properly type API response data
  constructor(annotationData: any) {
    this.annotationDataUUID = annotationData.annotationDataUUID;
    this.data = annotationData.data;

    makeObservable(this, {
      annotationDataUUID: observable,
      data: observable,
      correspondingLayerId: observable,

      setCorrespondingLayerId: action,
    });
  }

  public setCorrespondingLayerId(layerId: string): void {
    this.correspondingLayerId = layerId;
  }

  public toJSON(): AnnotationDataSnapshot {
    return {
      annotationDataUUID: this.annotationDataUUID,
      data: this.data,
    };
  }
}
