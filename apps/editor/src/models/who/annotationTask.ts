export interface AnnotationTaskSnapshotWHO {
  annotationTaskUUID: string;
  kind: string;
  title: string;
  description: string;
}

export enum AnnotationTaskTypeWHO {
  Classification = "classification",
  ObjectDetection = "object_detection",
  SemanticSegmentation = "semantic_segmentation",
  InstanceSegmentation = "instance_segmentation",
}

export class AnnotationTaskWHO {
  public annotationTaskUUID: string;
  public kind: AnnotationTaskTypeWHO;
  public title: string;
  public description: string;

  // TODO: Properly type API response data
  constructor(annotationTask: any) {
    this.annotationTaskUUID = annotationTask.annotationTaskUUID;
    this.kind = annotationTask.kind;
    this.title = annotationTask.title;
    this.description = annotationTask.description;
  }

  public toJSON(): AnnotationTaskSnapshotWHO {
    return {
      annotationTaskUUID: this.annotationTaskUUID,
      kind: this.kind,
      title: this.title,
      description: this.description,
    };
  }
}
