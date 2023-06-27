export interface WHOReviewerSnapshot {
  reviewerUUID: string;
}

export class WHOReviewer {
  public reviewerUUID: string;

  // TODO: Properly type API response data
  constructor(reviewer: any) {
    this.reviewerUUID = reviewer.reviewerUUID;
  }

  public toJSON(): WHOReviewerSnapshot {
    return {
      reviewerUUID: this.reviewerUUID,
    };
  }
}
