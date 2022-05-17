import { AnnotationDataSnapshot, IAnnotationData } from "./annotationData";
import { IUser, UserSnapshot } from "./user";

export enum AnnotationStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Rejected = "REJECTED",
}

export interface AnnotationSnapshot {
  annotationUUID: string;
  status: AnnotationStatus;
  annotationDataList: AnnotationDataSnapshot[];
  annotator: UserSnapshot;
  submittedAt: string;
}

export interface IAnnotation {
  annotationUUID: string;
  status: AnnotationStatus;
  data: IAnnotationData[];
  annotator: IUser;
  submittedAt: string;

  toJSON(): AnnotationSnapshot;
}
