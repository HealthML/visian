import { AnnotationData, AnnotationDataSnapshot } from "./annotationData";
import { AnnotationTask, AnnotationTaskSnapshot } from "./annotationTask";
import { Annotator, AnnotatorSnapshot } from "./annotator";

export enum AnnotationStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Rejected = "REJECTED",
}

export interface AnnotationSnapshot {
  annotationUUID: string;
  annotationTask: AnnotationTaskSnapshot;
  status: AnnotationStatus;
  data: AnnotationDataSnapshot;
  annotator: AnnotatorSnapshot;
  submittedAt: string;
}

export class Annotation {
  public annotationUUID: string;
  public annotationTask: AnnotationTask;
  public status: AnnotationStatus;
  public data: AnnotationData;
  public annotator: Annotator;
  public submittedAt: string;

  constructor(annotation: any) {
    this.annotationUUID = annotation.annotationUUID;
    this.annotationTask = new AnnotationTask(annotation.annotationTask);
    this.status = annotation.status;
    this.data = new AnnotationData(annotation.data);
    this.annotator = new Annotator(annotation.annotator);
    this.submittedAt = annotation.submittedAt;
  }

  public toJSON(): AnnotationSnapshot {
    return {
      annotationUUID: this.annotationUUID,
      annotationTask: this.annotationTask.toJSON(),
      status: this.status,
      data: this.data.toJSON(),
      annotator: this.annotator.toJSON(),
      submittedAt: this.submittedAt,
    };
  }
}
