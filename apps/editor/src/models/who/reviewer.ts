import { IReviewer, ReviewerSnapshot } from "@visian/ui-shared";

export class Reviewer implements IReviewer {
  public reviewerUUID: string;

  // TODO: Properly type API response data
  // TODO: Make observable
  constructor(reviewer: any) {
    this.reviewerUUID = reviewer.reviewerUUID;
  }

  public toJSON(): ReviewerSnapshot {
    return {
      reviewerUUID: this.reviewerUUID,
    };
  }
}
