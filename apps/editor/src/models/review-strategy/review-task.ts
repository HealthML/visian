import { FileWithMetadata } from "@visian/utils";
import { AxiosResponse } from "axios";

import { Document } from "../editor";

export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}

export abstract class ReviewTask {
  /** The kind of the task. Can be used to limit or extend editor functionality
   * based on the task kind the user is supposed to perform.
   */
  public abstract get kind(): TaskType;
  /** The id of the task. */
  public abstract get id(): string;
  /** The title of the task. */
  public abstract get title(): string | undefined;
  /** The description of the task, i.e. what the user has to do. */
  public abstract get description(): string | undefined;

  /** All valid annotation ids of the task. */
  public abstract get annotationIds(): string[];

  /** Raw image files.
   * Each task refers to one scan, which is possibly composed of multiple image files (layers).
   * */
  public abstract getImageFiles(): Promise<File[]>;

  /** Files of the annotation layers of an annotation group.
   * @returns a promise of the files of the annotation layers of an annotation group.
   */
  public abstract getAnnotationFiles(
    annotationId: string,
  ): Promise<FileWithMetadata[] | null>;

  /** Creates a new annotation for the task, which is possibly composed of multiple files.
   * @returns a promise of the new annotation id
   */
  public abstract createAnnotation(files: File[]): Promise<string>;

  /** Updates an existing annotation for the task by overwriting its files.
   *  If the backend supoorts updating individual annotations, changes can be saved to the backend.
   *  If the backend supports only saving the entire task at once, only the intermediate model (the task) is updated locally.
   */
  public abstract updateAnnotation(
    annotationId: string,
    files: File[],
  ): Promise<void>;

  /** Saves the entire task and all its changes to the backend.
   *  Usually called if the backend only supports saving the entire task at once and not
   *  individual annotations.
   */
  public abstract save(document: Document): Promise<AxiosResponse | undefined>;
}
