import { IImageLayer, ILayerFamily } from "@visian/ui-shared";
import {
  getWHOTask,
  getWHOTaskIdFromUrl,
  setNewTaskIdForUrl,
} from "@visian/utils";

import { whoHome } from "../../constants";
import { FileWithMetadata } from "../../types";
import { ImageLayer } from "../editor";
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
    const families = this.store.editor.activeDocument?.layerFamilies;
    if (!families) return;

    await Promise.all(
      families.map(async (family: ILayerFamily) => {
        const annotationId = family.metaData?.id;
        const annotationFiles = await this.getFilesForFamily(family);
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
        (annotationLayer) => annotationLayer.family === undefined,
      );
    if (!orphanLayers) return;
    const files = await this.getFilesForLayers(orphanLayers);
    await this.currentTask?.createAnnotation(files);
  }

  // Importing
  private async buildTask() {
    const taskId = getWHOTaskIdFromUrl();
    if (!taskId) throw new Error("No WHO task specified in URL.");

    const whoTask = await getWHOTask(taskId);
    if (!whoTask) throw new Error("WHO Task not found.");
    this.setCurrentTask(new WHOReviewTask(whoTask));
  }

  private async importImages(): Promise<void> {
    const imageFiles = this.task?.getImageFiles();
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
        const annotationFiles = this.task?.getAnnotationFiles(annotationId);
        if (!annotationFiles) throw new Error("Annotation files not found");

        const familyFiles = this.store.editor.activeDocument?.createLayerFamily(
          annotationFiles,
          `Annotation ${idx + 1}`,
          { id: annotationId },
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

  // Saving
  private async getFilesForFamily(family: ILayerFamily): Promise<File[]> {
    const annotationLayers = family.layers.filter(
      (layer) => layer.kind === "image" && layer.isAnnotation,
    ) as ImageLayer[];

    return this.getFilesForLayers(annotationLayers);
  }

  private async getFilesForLayers(layers: IImageLayer[]): Promise<File[]> {
    return Promise.all(
      layers.map(async (layer: IImageLayer) => {
        const layerFile =
          await this.store?.editor.activeDocument?.getFileForLayer(layer.id);
        if (!layerFile) {
          throw new Error(`Could not retrieve file for layer ${layer.id}.`);
        }

        // Append metadata to file in order to store it in the correct AnnotationData object
        if (layer.metaData) {
          const fileWithMetadata = layerFile as FileWithMetadata;
          fileWithMetadata.metadata = layer.metaData;
          return fileWithMetadata;
        }
        return layerFile;
      }),
    );
  }
}
