import { IUser, UserRole, UserSnapshot } from "@visian/ui-shared";
import { Annotator } from "./annotator";
import { Reviewer } from "./reviewer";

export class User implements IUser {
  public userUUID: string;
  public idpID: string;
  public username: string;
  public birthdate: string;
  public timezone: string;
  public email: string;
  public annotatorRole?: Annotator;
  public reviewerRole?: Reviewer;

  // TODO: Properly type API response data
  // TODO: Make observable
  constructor(user: any) {
    this.userUUID = user.userUUID;
    this.idpID = user.idpID;
    this.username = user.username;
    this.birthdate = user.birthdate;
    this.timezone = user.timezone;
    this.email = user.email;
    if (user.annotatorRole && "annotatorUUID" in user.annotatorRole) {
      this.annotatorRole = new Annotator(user.annotatorRole);
    }
    if (user.reviewerRole && "reviewerUUID" in user.reviewerRole) {
      this.reviewerRole = new Reviewer(user.reviewerRole);
    }
  }

  // TODO: Return actual role name
  public getRoleName(): UserRole {
    if (this.reviewerRole) return "Reviewer";
    if (this.annotatorRole) return "Annotator";
    return "Supervisor";
  }

  public toJSON(): UserSnapshot {
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
