import { AnnotationData, AnnotationDataSnapshot } from "./annotationData";
import { Annotator, AnnotatorSnapshot } from "./annotator";

export enum AnnotationStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Rejected = "REJECTED",
}

export interface AnnotationSnapshot {
  annotationUUID: string;
  status: AnnotationStatus;
  annotationDataList: AnnotationDataSnapshot[];
  annotator: AnnotatorSnapshot;
  submittedAt: string;
}

export class Annotation {
  public annotationUUID: string;
  public status: AnnotationStatus;
  public data: AnnotationData[];
  public annotator: Annotator;
  public submittedAt: string;

  // TODO: Properly type API response data
  constructor(annotation: any) {
    this.annotationUUID = annotation.annotationUUID;
    this.status = annotation.status;
    this.data = annotation.data.map(
      (annotationData: any) => new AnnotationData(annotationData),
    );
    this.annotator = new Annotator(annotation.annotator);
    this.submittedAt = annotation.submittedAt;
  }

  public toJSON(): AnnotationSnapshot {
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
