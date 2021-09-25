export interface AnnotatorSnapshot {
  userUUID: string;
  username: string;
  expertise: string;
}

export class Annotator {
  public userUUID: string;
  public username: string;
  public expertise: string;

  constructor(annotator: any) {
    this.userUUID = annotator.userUUID;
    this.username = annotator.username;
    this.expertise = annotator.expertise;
  }

  public toJSON(): AnnotatorSnapshot {
    return {
      userUUID: this.userUUID,
      username: this.username,
      expertise: this.expertise,
    };
  }
}
