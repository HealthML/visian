export interface ReviewerSnapshot {
  reviewerUUID: string;
}

export class Reviewer {
  public reviewerUUID: string;

  // TODO: Properly type API response data
  constructor(reviewer: any) {
    this.reviewerUUID = reviewer.reviewerUUID;
  }

  public toJSON(): ReviewerSnapshot {
    return {
      reviewerUUID: this.reviewerUUID,
    };
  }
}
