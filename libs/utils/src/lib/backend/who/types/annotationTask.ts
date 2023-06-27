export interface WHOAnnotationTaskSnapshot {
  annotationTaskUUID: string;
  kind: string;
  title: string;
  description: string;
}

export enum WHOAnnotationTaskType {
  Classification = "classification",
  ObjectDetection = "object_detection",
  SemanticSegmentation = "semantic_segmentation",
  InstanceSegmentation = "instance_segmentation",
}

export class WHOAnnotationTask {
  public annotationTaskUUID: string;
  public kind: WHOAnnotationTaskType;
  public title: string;
  public description: string;

  // TODO: Properly type API response data
  constructor(annotationTask: any) {
    this.annotationTaskUUID = annotationTask.annotationTaskUUID;
    this.kind = annotationTask.kind;
    this.title = annotationTask.title;
    this.description = annotationTask.description;
  }

  public toJSON(): WHOAnnotationTaskSnapshot {
    return {
      annotationTaskUUID: this.annotationTaskUUID,
      kind: this.kind,
      title: this.title,
      description: this.description,
    };
  }
}
