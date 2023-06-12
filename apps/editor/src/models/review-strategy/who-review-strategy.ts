import {
  createFileFromBase64,
  getWHOTask,
  getWHOTaskIdFromUrl,
  WHOAnnotationStatus,
  WHOTask,
  WHOTaskType,
} from "@visian/utils";

import { ReviewStrategy } from "./review-strategy";
import { Task, TaskType } from "./task";
import { TaskAnnotation, TaskAnnotationStatus } from "./task-annotation";

const annotationStatusMapping = {
  [WHOAnnotationStatus.Pending]: TaskAnnotationStatus.Pending,
  [WHOAnnotationStatus.Rejected]: TaskAnnotationStatus.Rejected,
  [WHOAnnotationStatus.Completed]: TaskAnnotationStatus.Completed,
};

export class WHOReviewStrategy extends ReviewStrategy {
  private whoTask?: WHOTask;

  public async loadTask(): Promise<void> {
    this.store.setProgress({ labelTx: "importing", showSplash: true });
    try {
      const taskId = getWHOTaskIdFromUrl();
      if (!taskId) throw new Error();
      this.whoTask = await getWHOTask(taskId);
      this.currentTask = this.createTaskFromWHO();

      this.loadImage();
      this.loadAnnotations();
    } catch (error) {
      this.store.setError({
        titleTx: "import-error",
        descriptionTx: "remote-file-error",
      });
      this.store.editor.setActiveDocument();
    }

    this.store.setProgress();
  }

  private createTaskFromWHO(): Task {
    if (!this.whoTask) throw new Error("WHO Task is undefined");

    const kind = taskTypeMapping[this.whoTask.kind];
    const { title, description } = this.whoTask.annotationTasks[0];

    const imageIds = this.whoTask.samples.map((sample) => sample.sampleUUID);

    // We want to ignore possible other annotations if type is "CREATE"
    if (kind === TaskType.Create) this.whoTask.annotations = [];

    const annotations = this.whoTask.annotations.map(
      (whoAnnotation) =>
        new TaskAnnotation(
          whoAnnotation.annotationUUID,
          annotationStatusMapping[whoAnnotation.status],
        ),
    );

    return new Task(kind, title, description, imageIds, annotations);
  }

  private async loadImage(): Promise<void> {
    if (!this.whoTask || !this.currentTask)
      throw new Error("WHO Task is undefined");

    const imageFiles = this.getImageFiles(this.currentTask.imageIds);

    if (!imageFiles) throw new Error("Image files are undefined");
    await this.store.editor.activeDocument?.importFiles(
      imageFiles,
      undefined,
      false,
    );
  }

  private async loadAnnotations(): Promise<void> {
    if (!this.whoTask || !this.currentTask)
      throw new Error("WHO Task is undefined");

    // Add a new annotation layer only for task type "create"
    if (this.currentTask.kind === TaskType.Create) {
      this.store.editor.activeDocument?.finishBatchImport();
      return;
    }

    this.currentTask.annotations.forEach(async (annotation, index) => {
      const title = this.whoTask?.samples[0].title || `annotation_${index}`;
      const annotationFiles = this.getAnnotationFiles(
        annotation.annotationId,
        title,
      );

      if (!annotationFiles) throw new Error("Annotation files are undefined");
      await this.store.editor.activeDocument?.importFiles(
        annotationFiles,
        title.replace(".nii", "_annotation"),
        true,
      );
    });
  }

  private getImageFiles(imageIds: string[]): File[] {
    return imageIds.map((imageId) => {
      const sample = this.whoTask?.samples.find(
        (whoSample) => whoSample.sampleUUID === imageId,
      );
      if (!sample) throw new Error("Sample not found");

      return createFileFromBase64(sample?.title, sample?.data);
    });
  }

  private getAnnotationFiles(annotationId: string, title: string): File[] {
    const whoAnnotation = this.whoTask?.annotations.find(
      (annotation) => annotation.annotationUUID === annotationId,
    );
    if (!whoAnnotation) throw new Error("WHO Annotation not found");

    return whoAnnotation?.data.map((annotationData) =>
      createFileFromBase64(
        title.replace(".nii", "_annotation").concat(".nii"),
        annotationData.data,
      ),
    );
  }
}
