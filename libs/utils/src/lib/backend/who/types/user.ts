import { WHOAnnotator, WHOAnnotatorSnapshot } from "./annotator";
import { WHOReviewer, WHOReviewerSnapshot } from "./reviewer";

export interface WHOUserSnapshot {
  userUUID: string;
  idpID: string;
  username: string;
  birthdate: string;
  timezone: string;
  email: string;
  annotatorRole: WHOAnnotatorSnapshot | Record<string, never>;
  reviewerRole: WHOReviewerSnapshot | Record<string, never>;
}

export class WHOUser {
  public userUUID: string;
  public idpID: string;
  public username: string;
  public birthdate: string;
  public timezone: string;
  public email: string;
  public annotatorRole?: WHOAnnotator;
  public reviewerRole?: WHOReviewer;

  // TODO: Properly type API response data
  constructor(user: any) {
    this.userUUID = user.userUUID;
    this.idpID = user.idpID;
    this.username = user.username;
    this.birthdate = user.birthdate;
    this.timezone = user.timezone;
    this.email = user.email;
    if (user.annotatorRole && Object.keys(user.annotatorRole).length > 1) {
      this.annotatorRole = new WHOAnnotator(user.annotatorRole);
    }
    if (user.reviewerRole && Object.keys(user.reviewerRole).length > 1) {
      this.reviewerRole = new WHOReviewer(user.reviewerRole);
    }
  }

  public toJSON(): WHOUserSnapshot {
    return {
      userUUID: this.userUUID,
      idpID: this.idpID,
      username: this.username,
      birthdate: this.birthdate,
      timezone: this.timezone,
      email: this.email,
      annotatorRole: this.annotatorRole ? this.annotatorRole.toJSON() : {},
      reviewerRole: this.reviewerRole ? this.reviewerRole.toJSON() : {},
    };
  }
}
