import { FileWithMetadata } from "../../types";

export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}

export interface ReviewTask {
  kind: TaskType;
  get id(): string;
  get title(): string;
  get description(): string;
  get annotationIds(): string[];
  getImageFiles(): File[];
  getAnnotationFiles(annotationId: string): FileWithMetadata[] | null;
  createAnnotation(files: File[]): Promise<void>;
  updateAnnotation(annotationId: string, files: File[]): Promise<void>;
  save(): Promise<Response>;
}
