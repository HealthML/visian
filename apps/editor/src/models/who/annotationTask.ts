import {
  AnnotationTaskSnapshot,
  AnnotationTaskType,
  IAnnotationTask,
} from "@visian/ui-shared";

export class AnnotationTask implements IAnnotationTask {
  public annotationTaskUUID: string;
  public kind: AnnotationTaskType;
  public title: string;
  public description: string;

  // TODO: Properly type API response data
  // TODO: Make observable
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
