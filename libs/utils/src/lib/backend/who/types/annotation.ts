import { WHOAnnotationData, WHOAnnotationDataSnapshot } from "./annotationData";
import { WHOUser, WHOUserSnapshot } from "./user";

export enum WHOAnnotationStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Rejected = "REJECTED",
}

export interface WHOAnnotationSnapshot {
  annotationUUID: string;
  status: WHOAnnotationStatus;
  annotationDataList: WHOAnnotationDataSnapshot[];
  annotator: WHOUserSnapshot;
  submittedAt: string;
}

export class WHOAnnotation {
  public annotationUUID: string;
  public status: WHOAnnotationStatus;
  public data: WHOAnnotationData[];
  public annotator: WHOUser;
  public submittedAt: string;

  // TODO: Properly type API response data
  constructor(annotation: any) {
    this.annotationUUID = annotation.annotationUUID;
    this.status = annotation.status;
    this.data = annotation.data.map(
      (annotationData: any) => new WHOAnnotationData(annotationData),
    );
    this.annotator = new WHOUser(annotation.annotator);
    this.submittedAt = annotation.submittedAt;
  }

  public toJSON(): WHOAnnotationSnapshot {
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
