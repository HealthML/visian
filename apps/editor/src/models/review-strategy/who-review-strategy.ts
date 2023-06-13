import { getWHOTask, getWHOTaskIdFromUrl } from "@visian/utils";

import { ReviewStrategy } from "./review-strategy";
import { TaskType } from "./review-task";
import { WHOReviewTask } from "./who-review-task";

export class WHOReviewStrategy extends ReviewStrategy {
  public async loadTask(): Promise<void> {
    if (!this.store.editor.newDocument(true)) return;
    this.store.setProgress({ labelTx: "importing", showSplash: true });

    try {
      await this.buildTask();
      await this.importImages();
      await this.importAnnotations();
    } catch {
      this.store.setError({
        titleTx: "import-error",
        descriptionTx: "remote-file-error",
      });
      this.store.editor.setActiveDocument();
    }
    this.store.setProgress();
  }

  public nextTask(): void {
    throw new Error("Method not implemented.");
  }

  public saveTask(): void {
    // TODO: add new annotation objects for each new annotation group
    throw new Error("Method not implemented.");
  }

  public async buildTask() {
    const taskId = getWHOTaskIdFromUrl();
    if (!taskId) throw new Error("No WHO task specified in URL.");

    const whoTask = await getWHOTask(taskId);
    if (!whoTask) throw new Error("WHO Task not found.");
    this.setCurrentTask(new WHOReviewTask(whoTask));
  }

  private async importImages(): Promise<void> {
    const imageFiles = this.task?.getImageFiles();
    if (!imageFiles) throw new Error("Image files not found");

    const fileTransfer = new DataTransfer();
    imageFiles.forEach((file) => fileTransfer.items.add(file));
    importFilesToDocument(fileTransfer.files, this.store);
  }

  private async importAnnotations(): Promise<void> {
    if (this.task?.kind === TaskType.Create) {
      this.store.editor.activeDocument?.finishBatchImport();
      return;
    }

    this.task?.annotationIds.forEach(async (annotationId, idx) => {
      const annotationFiles = this.task?.getAnnotationFiles(annotationId);
      if (!annotationFiles) throw new Error("Annotation files not found");

      const groupedFiles = this.store.editor.activeDocument?.createLayerGroup(
        annotationFiles,
        `Annotation ${idx + 1}`,
        { id: annotationId },
      );
      if (!groupedFiles) throw new Error();

      const fileTransfer = new DataTransfer();
      groupedFiles.forEach((file) => fileTransfer.items.add(file));
      importFilesToDocument(fileTransfer.files, this.store);
    });
  }
}
