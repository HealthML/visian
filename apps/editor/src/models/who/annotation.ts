import { toJS } from "mobx";
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
  data: string[];
  annotator: AnnotatorSnapshot;
  submittedAt: string;
}

export class Annotation {
  public annotationUUID: string;
  public annotationTask: AnnotationTask;
  public status: AnnotationStatus;
  public data: string[];
  public annotator: Annotator;
  public submittedAt: string;

  constructor(annotation: any) {
    this.annotationUUID = annotation.annotationUUID;
    this.annotationTask = annotation.annotationTask;
    this.status = annotation.status;
    this.data = annotation.data;
    this.annotator = new Annotator(annotation.annotator);
    this.submittedAt = annotation.submittedAt;
  }

  public toJSON(): AnnotationSnapshot {
    return {
      annotationUUID: this.annotationUUID,
      annotationTask: this.annotationTask.toJSON(),
      status: this.status,
      data: toJS(this.data),
      annotator: this.annotator.toJSON(),
      submittedAt: this.submittedAt,
    };
  }
}
