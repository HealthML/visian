import { AnnotatorSnapshot, IAnnotator } from "./annotator";
import { IReviewer, ReviewerSnapshot } from "./reviewer";

export const UserRoles = ["Annotator", "Reviewer", "Supervisor"] as const;
export type UserRole = typeof UserRoles[number];

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
