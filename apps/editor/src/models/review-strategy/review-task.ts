import { FileWithMetadata } from "@visian/utils";
import { AxiosResponse } from "axios";

import { Document } from "../editor";

export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}

export abstract class ReviewTask {
  public abstract get kind(): TaskType;
  public abstract get id(): string;
  public abstract get title(): string | undefined;
  public abstract get description(): string | undefined;

  // All valid Annotation Ids for the task
  public abstract get annotationIds(): string[];

  // Each task refers to one Scan, possibly composed of multiple image files
  public abstract getImageFiles(): Promise<File[]>;

  // Each Annotation for a Task is possibly composed
  public abstract getAnnotationFiles(
    annotationId: string,
  ): Promise<FileWithMetadata[] | null>;

  // Creates a new annotation for the task composed of multiple files and returns the new annotation id
  public abstract createAnnotation(files: File[]): Promise<string>;

  // Updates an existing annotation for the task by overwriting its files
  public abstract updateAnnotation(
    annotationId: string,
    files: File[],
  ): Promise<void>;

  // After calling save, we expect all changes made to the task to be saved to the backend
  public abstract save(document: Document): Promise<AxiosResponse | undefined>;
}
