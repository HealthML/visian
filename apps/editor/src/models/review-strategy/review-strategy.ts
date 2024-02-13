import { action, makeObservable, observable } from "mobx";
import path from "path";

import { RootStore } from "../root";
import { ReviewStrategySnapshot } from "./review-strategy-snapshot";
import { ReviewTask } from "./review-task";

export abstract class ReviewStrategy {
  protected store: RootStore;
  protected task?: ReviewTask;

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
            path.basename(
              annotationFiles[0].name,
              path.extname(annotationFiles[0].name),
            ),
            getMetadataFromChild
              ? { ...annotationFiles[0]?.metadata }
              : { id: annotationId, kind: "annotation", backend: "who" },
          );
        if (!groupFiles) throw new Error("No active Document");

        // isAnnotation is unnessesary because it's only called here
        // with an array, and then the isAnnotation is not used in importFiles
        await this.store?.editor.activeDocument?.importFiles(
          groupFiles,
          undefined,
          true,
        );
      }),
    );
  }

  public abstract toJSON(): ReviewStrategySnapshot;
}
