export enum TaskAnnotationStatus {
  Pending = "pending",
  Completed = "completed",
  Rejected = "rejected",
}

export class TaskAnnotation {
  public annotationId: string;
  public status: TaskAnnotationStatus;

  constructor(annotationId: string, status: TaskAnnotationStatus) {
    this.annotationId = annotationId;
    this.status = status;
  }
}
