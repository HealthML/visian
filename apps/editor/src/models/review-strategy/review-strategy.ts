import { action, makeObservable, observable } from "mobx";

import { Document } from "../editor";
import { RootStore } from "../root";
import { ReviewStrategySnapshot } from "./review-strategy-snapshot";
import { ReviewTask } from "./review-task";

export abstract class ReviewStrategy<Task extends ReviewTask> {
  protected store: RootStore;
  protected task?: Task;

  constructor({ store }: { store: RootStore }) {
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
      this.postProcessLoadedTask();
    } catch {
      this.store.setError({
        titleTx: "import-error",
        descriptionTx: "remote-file-error",
      });
      this.store.editor.setActiveDocument();
    }
    this.store.setProgress();
  }

  public setCurrentTask(task: Task) {
    this.task = task;
  }
  public get currentTask(): Task | undefined {
    return this.task;
  }

  public get supportsPreviousTask() {
    return false;
  }

  public abstract previousTask(): Promise<void>;
  public abstract nextTask(): Promise<void>;
  public abstract saveTask(): Promise<void>;

  protected abstract buildTask(): Promise<void>;

  protected abstract importAnnotations(): Promise<void>;
  private async importImages(): Promise<void> {
    const imageFiles = await this.task?.getImageFiles();
    if (!imageFiles) throw new Error("Image files not found");
    await this.store?.editor.activeDocument?.importFiles(
      imageFiles,
      undefined,
      false,
    );
  }

  protected async importAnnotationsWithMetadata(
    getMetadataFromChild: boolean,
  ): Promise<void> {
    if (!this.task?.annotationIds) return;
    await Promise.all(
      this.task?.annotationIds.map(async (annotationId, idx) => {
        const annotationFiles = await this.task?.getAnnotationFiles(
          annotationId,
        );
        if (!annotationFiles) throw new Error("Annotation files not found");

        const groupFiles =
          this.store.editor.activeDocument?.createAnnotationGroup(
            annotationFiles,
            `Annotation ${idx + 1}`,
            getMetadataFromChild
              ? { ...annotationFiles[0]?.metadata }
              : { id: annotationId, kind: "annotation", backend: "who" },
          );
        if (!groupFiles) throw new Error("No active Document");

        await this.store?.editor.activeDocument?.importFiles(
          groupFiles,
          undefined,
          true,
        );
      }),
    );
  }

  // After loading the task, depending on the strategy we might need to do some post processing
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public postProcessLoadedTask(): void {}

  public abstract toJSON(): ReviewStrategySnapshot;

  protected getDocument(): Document {
    const document = this.store.editor.activeDocument;
    if (!document) throw new Error("No active document");
    return document;
  }
}
