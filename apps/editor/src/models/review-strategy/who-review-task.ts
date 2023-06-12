import { createFileFromBase64, WHOTask, WHOTaskType } from "@visian/utils";

import { FileWithMetadata } from "../../types";
import { ReviewTask, TaskType } from "./review-task";

const taskTypeMapping = {
  [WHOTaskType.Create]: TaskType.Create,
  [WHOTaskType.Correct]: TaskType.Review,
  [WHOTaskType.Review]: TaskType.Supervise,
};

export class WHOReviewTask implements ReviewTask {
  private whoTask: WHOTask;

  public get kind(): TaskType {
    return taskTypeMapping[this.whoTask.kind];
  }

  public get title(): string {
    return this.whoTask.annotationTasks[0].title;
  }

  public get description(): string {
    return this.whoTask.annotationTasks[0].description;
  }

  public get annotationIds(): string[] {
    return this.whoTask.annotations.map(
      (annotation) => annotation.annotationUUID,
    );
  }

  constructor(whoTask: WHOTask) {
    // If kind is CREATE we want to ignore all existing annotations
    if (whoTask.kind === WHOTaskType.Create) {
      whoTask.annotations = [];
    }
    this.whoTask = whoTask;
  }

  public getImageFiles(): File[] {
    return this.whoTask.samples.map((sample) =>
      createFileFromBase64(sample?.title, sample?.data),
    );
  }

  public getAnnotationFiles(annotationId: string): FileWithMetadata[] | null {
    const title = this.whoTask?.samples[0]?.title;
    const whoAnnotation = this.whoTask?.annotations.find(
      (annotation) => annotation.annotationUUID === annotationId,
    );
    if (!whoAnnotation) return null;

    return whoAnnotation.data.map((annotationData, idx) => {
      const file = createFileFromBase64(
        title.replace(".nii", `_annotation_${idx}`).concat(".nii"),
        annotationData.data,
      ) as FileWithMetadata;

      // The file must contain the annotationDataUUID it belongs to
      // in order to later store the modified file back to the correct
      // WHOAnnotationData object
      file.metadata = { id: annotationData.annotationDataUUID };
      return file;
    });
  }
}
