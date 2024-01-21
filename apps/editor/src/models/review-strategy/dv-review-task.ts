import {
  DVAnnotationTask,
  DVAnnotationTaskSnapshot,
  createFileFromBase64,
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
    console.log("Get ID");
    return this.dvTask.taskID;
  }

  public get kind(): TaskType {
    console.log("Get Kind");
    return TaskType.Create;
  }

  public get title(): string {
    console.log("Get Title");
    return "Case ID: " + this.dvTask.case.caseID;
  }

  public get description(): string {
    console.log("Get Description");
    //TODO: Is there a proper description?
    return "DV Task Description Placeholder";
  }

  public get annotationIds(): string[] {
    console.log("Get Annotation IDs");
    return this.dvTask.annotationGroups.map((group) => group.annotationID);
  }

  constructor(dvTask: DVAnnotationTask) {
    super();
    this.dvTask = dvTask;
  }

  public async getImageFiles() {
    console.log("Get Image Files");
    return [createFileFromBase64("DV Image", this.dvTask.scan.data)];
  }

  public async getAnnotationFiles(annotationId: string) {
    console.log("Get Annotation Files");
    const id = this.dvTask.taskID;
    const dvAnnotation = this.dvTask?.annotationGroups.find(
      (annotation) => annotation.annotationID == annotationId,
    );
    if (!dvAnnotation) return null;

    //TODO return
    return [];
  }

  public async createAnnotation(files: File[]) {
    console.log("Create Annotation");
    return "newAnnotationId Placeholder";
  }

  public async updateAnnotation(
    annotationId: string,
    files: File[],
  ): Promise<void> {
    console.log("Update Annotation");
  }

  public async save(): Promise<AxiosResponse> {
    console.log("Save");
    return putDVTask(this.id, JSON.stringify(this.dvTask.toJSON()));
  }

  public toJSON(): DVReviewTaskSnapshot {
    return {
      dvAnnotationTaskSnap: this.dvTask.toJSON(),
    };
  }
}
