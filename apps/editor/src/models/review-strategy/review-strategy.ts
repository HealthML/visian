import { action, makeObservable, observable } from "mobx";

import { Document } from "../editor";
import { RootStore } from "../root";
import { ReviewStrategySnapshot } from "./review-strategy-snapshot";
import { ReviewTask } from "./review-task";

/**
 * Represents an abstract review strategy for a specific type of review task.
 * Each backend service has its own strategy implementation that extends this class.
 * The review strategy handles retrieval or creation of objects for the VISIAN editor and works in close
 * conjunction with a specific review task for the backend.
 * The task is responsible for converting common elements (files, metadata, etc.) into backend-specific
 * objects and ususally has no knowledge of editor specific objects (document, layers, annotation groups, etc.).
 * Provides methods for loading, saving, and navigating tasks, as well as importing images and annotations.
 * Subclasses must implement specific methods based on the backend requirements.
 *
 * @template Task - The type of review task associated with the strategy.
 */
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

  /**
   * Loads a task.
   * It creates a new document in the editor, imports images and annotations and post processes the task if necessary.
   * It catches any errors in the loading process.
   * @returns A promise that resolves when the task is loaded.
   */
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

  /**
   * Sets the current task for the review strategy.
   *
   * @param {Task} task - The task to set as the current task.
   * @returns {void}
   */
  public setCurrentTask(task: Task) {
    this.task = task;
  }
  /**
   * Gets the current task.
   * @returns The current task or undefined if there is no task.
   */
  public get currentTask(): Task | undefined {
    return this.task;
  }

  /** Whether the backend supports going back to the previous task. This might affect the functionality
   * of components in the editor.
   */
  public abstract supportsPreviousTask(): boolean;

  /** Whether the backend supports retrieving the next task. This might affect the functionality
   * of components in the editor.
   */
  public abstract supportsNextTask(): boolean;

  /** Loads the previous task. */
  public abstract previousTask(): Promise<void>;
  /** Loads the next task. */
  public abstract nextTask(): Promise<void>;
  /** Saves the current task, but does not load the next task. */
  public abstract saveTask(): Promise<void>;

  /** Fetches the current task from the backend and sets it
   * as the state on which all further actions are done (e.g. loading, updating, saving, ...). */
  protected abstract buildTask(): Promise<void>;

  /** Imports the annotation layers of a task and assigns them to groups. */
  protected abstract importAnnotations(): Promise<void>;
  /** Imports the image files associated with the task into the active document. */
  private async importImages(): Promise<void> {
    const imageFiles = await this.task?.getImageFiles();
    if (!imageFiles) throw new Error("Image files not found");
    await this.store?.editor.activeDocument?.importFiles(
      imageFiles,
      undefined,
      false,
    );
  }

  /**
   * Imports annotations with metadata and groups them. This metadata can be used to update
   * a specified annotation in the backend.
   *
   * @param getMetadataFromChild - A boolean indicating whether to get metadata from child annotations.
   * @returns A Promise that resolves when the import is complete.
   */
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

  /** After loading the task, depending on the strategy the task might need to be post processed. */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public postProcessLoadedTask(): void {}

  /** Creates a snapshot of the review stragey. */
  public abstract toJSON(): ReviewStrategySnapshot;

  /**
   * Retrieves the active document from the store.
   * @returns The active document.
   * @throws Error if there is no active document.
   */
  protected getDocument(): Document {
    const document = this.store.editor.activeDocument;
    if (!document) throw new Error("No active document");
    return document;
  }
}
