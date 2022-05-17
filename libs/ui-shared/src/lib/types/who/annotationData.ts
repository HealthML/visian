export interface AnnotationDataSnapshot {
  annotationDataUUID: string;
  data: string;
}

export interface IAnnotationData {
  annotationDataUUID: string;
  data: string;
  correspondingLayerId: string;

  setCorrespondingLayerId(layerId: string): void;
  toJSON(): AnnotationDataSnapshot;
}
