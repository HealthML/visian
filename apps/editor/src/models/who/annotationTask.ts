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

export class AnnotationTask {
  public annotationTaskUUID: string;
  public kind: AnnotationTaskType;
  public title: string;
  public description: string;

  constructor(annotationTask: any) {
    this.annotationTaskUUID = annotationTask.annotationTaskUUID;
    this.kind = annotationTask.kind;
    this.title = annotationTask.title;
    this.description = annotationTask.description;
  }

  public toJSON(): AnnotationTaskSnapshot {
    return {
      annotationTaskUUID: this.annotationTaskUUID,
      kind: this.kind,
      title: this.title,
      description: this.description,
    };
  }
}
