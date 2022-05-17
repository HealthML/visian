export interface AnnotationTaskSnapshot {
  annotationTaskUUID: string;
  kind: string;
  title: string;
  description: string;
}

export enum AnnotationTaskType {
  Classification = "classification",
  ObjectDetection = "object_detection",
  SemanticSegmentation = "semantic_segmentation",
  InstanceSegmentation = "instance_segmentation",
}

export interface IAnnotationTask {
  annotationTaskUUID: string;
  kind: AnnotationTaskType;
  title: string;
  description: string;

  toJSON(): AnnotationTaskSnapshot;
}
