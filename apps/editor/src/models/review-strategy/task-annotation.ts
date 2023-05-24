export enum TaskAnnotationStatus {
  Pending = "pending",
  Completed = "completed",
  Rejected = "rejected",
}

export class TaskAnnotation {
  public annotationIds: string[];
  public status: TaskAnnotationStatus;

  constructor(annotationIds: string[], status: TaskAnnotationStatus) {
    this.annotationIds = annotationIds;
    this.status = status;
  }
}
