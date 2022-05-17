export interface ReviewerSnapshot {
  reviewerUUID: string;
}

export interface IReviewer {
  reviewerUUID: string;

  toJSON(): ReviewerSnapshot;
}
