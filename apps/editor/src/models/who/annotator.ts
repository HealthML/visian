export interface AnnotatorSnapshot {
  userUUID: string;
  expertise: string;
}

export class Annotator {
  public userUUID: string;
  public expertise: string;

  constructor(annotator: any) {
    this.userUUID = annotator.userUUID;
    this.expertise = annotator.expertise;
  }

  public toJSON(): AnnotatorSnapshot {
    return {
      userUUID: this.userUUID,
      expertise: this.expertise,
    };
  }
}
