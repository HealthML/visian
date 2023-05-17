export interface ReviewerSnapshotWHO {
  reviewerUUID: string;
}

export class ReviewerWHO {
  public reviewerUUID: string;

  // TODO: Properly type API response data
  constructor(reviewer: any) {
    this.reviewerUUID = reviewer.reviewerUUID;
  }

  public toJSON(): ReviewerSnapshotWHO {
    return {
      reviewerUUID: this.reviewerUUID,
    };
  }
}
