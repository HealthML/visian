import { action, makeObservable, observable } from "mobx";

import { RootStore } from "../root";
import { ReviewTask, TaskType } from "./review-task";

export abstract class ReviewStrategy {
  protected store: RootStore;
  protected task?: ReviewTask;

  constructor(store: RootStore) {
    makeObservable<this, "task">(this, {
      task: observable,
      setCurrentTask: action,
    });
    this.store = store;
  }

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

  public setCurrentTask(task: ReviewTask) {
    this.task = task;
  }
  public get currentTask(): ReviewTask | undefined {
    return this.task;
  }
  public abstract nextTask(): Promise<void>;
  public abstract saveTask(): Promise<void>;

  protected abstract buildTask(): Promise<void>;

  private async importImages(): Promise<void> {
    const imageFiles = await this.task?.getImageFiles();
    if (!imageFiles) throw new Error("Image files not found");
    await this.store?.editor.activeDocument?.importFiles(
      imageFiles,
      undefined,
      false,
    );
  }

  private async importAnnotations(): Promise<void> {
    if (this.task?.kind === TaskType.Create) {
      this.store.editor.activeDocument?.finishBatchImport();
      return;
    }
    if (!this.task?.annotationIds) return;
    await Promise.all(
      this.task?.annotationIds.map(async (annotationId, idx) => {
        const annotationFiles = await this.task?.getAnnotationFiles(
          annotationId,
        );
        if (!annotationFiles) throw new Error("Annotation files not found");

        const familyFiles = this.store.editor.activeDocument?.createLayerFamily(
          annotationFiles,
          `Annotation ${idx + 1}`,
          { ...annotationFiles[0]?.metadata },
        );
        if (!familyFiles) throw new Error();

        await this.store?.editor.activeDocument?.importFiles(
          familyFiles,
          undefined,
          true,
        );
      }),
    );
  }
}
