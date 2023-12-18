import {
  DVAnnotationTask,
  DVAnnotationTaskSnapshot,
  putDVTask,
} from "@visian/utils";
import { AxiosResponse } from "axios";

import { ReviewTask, TaskType } from "./review-task";

export interface DVReviewTaskSnapshot {
  dvAnnotationTaskSnap: DVAnnotationTaskSnapshot;
}

export class DVReviewTask extends ReviewTask {
  public static fromSnapshot(snapshot: DVReviewTaskSnapshot) {
    return new DVReviewTask(
      new DVAnnotationTask(snapshot.dvAnnotationTaskSnap),
    );
  }

  private dvTask: DVAnnotationTask;

  public get id(): string {
    return this.dvTask.taskUUID;
  }

  public get kind(): TaskType {
    return TaskType.Create;
  }

  public get title(): string {
    //TODO: Is there a proper title?
    return "DV Task Title Placeholder";
  }

  public get description(): string {
    //TODO: Is there a proper description?
    return "DV Task Description Placeholder";
  }

  public get annotationIds(): string[] {
    return this.dvTask.annotations.map(
      (annotation) => annotation.annotationUUID,
    );
  }

  constructor(dvTask: DVAnnotationTask) {
    super();
    this.dvTask = dvTask;
  }

  public async getImageFiles() {
    //TODO: get image files from this.dvTask.scan.data?
    return [];
  }

  public async getAnnotationFiles(annotationId: string) {
    const id = this.dvTask.taskUUID;
    const dvAnnotation = this.dvTask?.annotations.find(
      (annotation) => annotation.annotationUUID === annotationId,
    );
    if (!dvAnnotation) return null;

    //TODO return
    return [];
  }

  public async createAnnotation(files: File[]) {
    return "newAnnotationId Placeholder";
  }

  public async updateAnnotation(
    annotationId: string,
    files: File[],
  ): Promise<void> {}

  public async save(): Promise<AxiosResponse> {
    return putDVTask(this.id, JSON.stringify(this.dvTask.toJSON()));
  }

  public toJSON(): DVReviewTaskSnapshot {
    return {
      dvAnnotationTaskSnap: this.dvTask.toJSON(),
    };
  }
}
