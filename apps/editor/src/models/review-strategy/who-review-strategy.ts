import { IImageLayer, IAnnotationGroup } from "@visian/ui-shared";
import {
  FileWithMetadata,
  getWHOTask,
  getWHOTaskIdFromUrl,
  setNewTaskIdForUrl,
} from "@visian/utils";

import { whoHome } from "../../constants";
import { ImageLayer } from "../editor";
import { RootStore } from "../root";
import { ReviewStrategy } from "./review-strategy";
import { ReviewStrategySnapshot } from "./review-strategy-snapshot";
import { TaskType } from "./review-task";
import { WHOReviewTask } from "./who-review-task";

export class WHOReviewStrategy extends ReviewStrategy {
  public static fromSnapshot(
    store: RootStore,
    snapshot?: ReviewStrategySnapshot,
  ) {
    if (!snapshot) return undefined;
    if (snapshot.backend === "who") {
      return new WHOReviewStrategy({
        store,
        currentReviewTask: snapshot.currentReviewTask
          ? WHOReviewTask.fromSnapshot(snapshot.currentReviewTask)
          : undefined,
      });
    }
    return undefined;
  }

  constructor({
    store,
    currentReviewTask,
  }: {
    store: RootStore;
    currentReviewTask?: WHOReviewTask;
  }) {
    super({ store });
    if (currentReviewTask) this.setCurrentTask(currentReviewTask);
  }

  public async nextTask(): Promise<void> {
    this.store.setProgress({ labelTx: "saving", showSplash: true });
    try {
      await this.saveTask();
      const response = await this.currentTask?.save();

      // TODO: return to WHO Home when response code is 204
      if (response) {
        const newLocation = response.headers["location"];
        if (newLocation) {
          const urlElements = newLocation.split("/");
          const newTaskId = urlElements[urlElements.length - 1];
          if (newTaskId !== this.currentTask?.id) {
            this.store?.setIsDirty(false, true);
            setNewTaskIdForUrl(newTaskId);
            await this.loadTask();
            return;
          }
        }
      }
      // If no new location is given, return to the WHO page
      window.location.href = whoHome;
    } catch {
      this.store?.setError({
        titleTx: "export-error",
        descriptionTx: "file-upload-error",
      });
      this.store.editor.setActiveDocument();
    }
    this.store.setProgress();
  }

  public async saveTask(): Promise<void> {
    const families = this.store.editor.activeDocument?.annotationGroups;
    if (!families) return;

    await Promise.all(
      families.map(async (group: IAnnotationGroup) => {
        const annotationId = group.metadata?.id;
        const annotationFiles = await this.getFilesForAnnotationGroup(group);
        if (annotationFiles.length === 0) return;
        if (annotationId) {
          await this.currentTask?.updateAnnotation(
            annotationId,
            annotationFiles,
          );
        } else {
          await this.currentTask?.createAnnotation(annotationFiles);
        }
      }),
    );

    const orphanLayers =
      this.store.editor.activeDocument?.annotationLayers.filter(
        (annotationLayer) => annotationLayer.annotationGroup === undefined,
      );
    if (!orphanLayers) return;
    const files = await this.getAnnotationFilesForLayers(orphanLayers);
    await this.currentTask?.createAnnotation(files);
  }

  // Importing
  protected async buildTask() {
    const taskId = getWHOTaskIdFromUrl();
    if (!taskId) throw new Error("No WHO task specified in URL.");

    const whoTask = await getWHOTask(taskId);
    if (!whoTask) throw new Error("WHO Task not found.");
    this.setCurrentTask(new WHOReviewTask(whoTask));
  }

  // Saving
  private async getFilesForAnnotationGroup(
    group: IAnnotationGroup,
  ): Promise<File[]> {
    const annotationLayers = group.layers.filter(
      (layer) => layer.kind === "image" && layer.isAnnotation,
    ) as ImageLayer[];

    return this.getAnnotationFilesForLayers(annotationLayers);
  }

  private async getAnnotationFilesForLayers(
    layers: IImageLayer[],
  ): Promise<File[]> {
    return Promise.all(
      layers.map(async (layer: IImageLayer) => {
        const layerFile =
          await this.store?.editor.activeDocument?.getFileForLayer(layer.id);
        if (!layerFile) {
          throw new Error(`Could not retrieve file for layer ${layer.id}.`);
        }

        // Append metadata to file in order to store it in the correct AnnotationData object
        if (layer.metadata) {
          const fileWithMetadata = layerFile as FileWithMetadata;
          fileWithMetadata.metadata = layer.metadata;
          return fileWithMetadata;
        }
        return layerFile;
      }),
    );
  }

  protected async importAnnotations(): Promise<void> {
    if (this.task?.kind === TaskType.Create) {
      this.store.editor.activeDocument?.finishBatchImport();
      return;
    }
    await this.importAnnotationsWithMetadata(false);
  }

  public toJSON(): ReviewStrategySnapshot {
    return {
      backend: "who",
      currentReviewTask: this.currentTask
        ? (this.currentTask as WHOReviewTask).toJSON()
        : undefined,
    };
  }
}
