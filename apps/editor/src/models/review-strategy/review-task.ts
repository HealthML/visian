import { FileWithMetadata } from "../../types";

export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}

export interface ReviewTask {
  kind: TaskType;
  get title(): string;
  get description(): string;
  get annotationIds(): string[];
  getImageFiles(): File[];
  getAnnotationFiles(annotationId: string): FileWithMetadata[] | null;
}
