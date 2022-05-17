import { AnnotatorSnapshot, IAnnotator } from "./annotator";
import { IReviewer, ReviewerSnapshot } from "./reviewer";

export type UserRole = "Annotator" | "Reviewer" | "Supervisor";

export interface UserSnapshot {
  userUUID: string;
  idpID: string;
  username: string;
  birthdate: string;
  timezone: string;
  email: string;
  annotatorRole: AnnotatorSnapshot | Record<string, never>;
  reviewerRole: ReviewerSnapshot | Record<string, never>;
}

export interface IUser {
  userUUID: string;
  idpID: string;
  username: string;
  birthdate: string;
  timezone: string;
  email: string;
  annotatorRole?: IAnnotator;
  reviewerRole?: IReviewer;

  getRoleName(): UserRole;
  toJSON(): UserSnapshot;
}
