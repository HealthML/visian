import { AnnotationDataSnapshotWHO, AnnotationDataWHO } from "./annotationData";
import { UserSnapshotWHO, UserWHO } from "./user";

export enum AnnotationStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Rejected = "REJECTED",
}

export interface AnnotationSnapshotWHO {
  annotationUUID: string;
  status: AnnotationStatus;
  annotationDataList: AnnotationDataSnapshotWHO[];
  annotator: UserSnapshotWHO;
  submittedAt: string;
}

export class AnnotationWHO {
  public annotationUUID: string;
  public status: AnnotationStatus;
  public data: AnnotationDataWHO[];
  public annotator: UserWHO;
  public submittedAt: string;

  // TODO: Properly type API response data
  constructor(annotation: any) {
    this.annotationUUID = annotation.annotationUUID;
    this.status = annotation.status;
    this.data = annotation.data.map(
      (annotationData: any) => new AnnotationDataWHO(annotationData),
    );
    this.annotator = new UserWHO(annotation.annotator);
    this.submittedAt = annotation.submittedAt;
  }

  public toJSON(): AnnotationSnapshotWHO {
    return {
      annotationUUID: this.annotationUUID,
      status: this.status,
      annotationDataList: Object.values(this.data).map((annotationData) =>
        annotationData.toJSON(),
      ),
      annotator: this.annotator.toJSON(),
      submittedAt: this.submittedAt,
    };
  }
}
