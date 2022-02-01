export const AnnotatorRoles = ["Annotator", "Reviewer", "Supervisor"] as const;
export type AnnotatorRole = typeof AnnotatorRoles[number];

export interface AnnotatorSnapshot {
  userUUID: string;
  username: string;
  expertise: string;
  role: AnnotatorRole;
}

export class Annotator {
  public userUUID: string;
  public username: string;
  public expertise: string;
  public role: AnnotatorRole;

  // TODO: Properly type API response data
  constructor(annotator: any) {
    this.userUUID = annotator.userUUID;
    this.username = annotator.username;
    this.expertise = annotator.expertise;
    this.role = annotator.role;
  }

  public toJSON(): AnnotatorSnapshot {
    return {
      userUUID: this.userUUID,
      username: this.username,
      expertise: this.expertise,
      role: this.role,
    };
  }
}
