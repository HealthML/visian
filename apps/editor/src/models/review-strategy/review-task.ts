import { AxiosResponse } from "axios";

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

  // All valid Annotation Ids for the task
  get annotationIds(): string[];

  // Each task refers to one Scan, possibly composed of multiple image files
  getImageFiles(): Promise<File[]>;

  // Each Annotation for a Task is possibly composed
  getAnnotationFiles(annotationId: string): Promise<FileWithMetadata[] | null>;

  // Creates a new annotation for the task composed of multiple files and returns the new annotation id
  createAnnotation(files: File[]): Promise<string>;

  // Updates an existing annotation for the task by overwriting its files
  updateAnnotation(annotationId: string, files: File[]): Promise<void>;

  // After calling save, we expect all changes made to the task to be saved to the backend
  save(): Promise<AxiosResponse>;
}
