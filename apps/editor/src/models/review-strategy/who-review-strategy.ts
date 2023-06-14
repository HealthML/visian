import { IImageLayer, ILayerGroup } from "@visian/ui-shared";
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
    this.saveTask();
    try {
      const response = await this.currentTask?.save();

      // TODO: return to WHO Home when response code is 204
      if (response) {
        const newLocation = response.headers.get("location");
        if (newLocation) {
          const urlElements = newLocation.split("/");
          const newTaskId = urlElements[urlElements.length - 1];

          if (newTaskId !== this.currentTask?.id) {
            this.store?.setIsDirty(false, true);
            setNewTaskIdForUrl(newTaskId);
            this.loadTask();
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
    }
    throw new Error("Method not implemented.");
  }

  public async saveTask(): Promise<void> {
    const groups = this.store.editor.activeDocument?.layers.filter(
      (annotationLayer) => annotationLayer.kind === "group",
    ) as ILayerGroup[];
    if (!groups) return;

    await Promise.all(
      groups.map(async (groupLayer: ILayerGroup) => {
        const annotationId = groupLayer.metaData?.id;
        const annotationFiles = await this.generateFilesForGroup(groupLayer);

        if (annotationId) {
          this.currentTask?.updateAnnotation(annotationId, annotationFiles);
        } else {
          this.currentTask?.createAnnotation(annotationFiles);
        }
      }),
    );
    throw new Error("Method not implemented.");
  }

  // Importing
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

    this.task?.annotationIds.forEach(async (annotationId, idx) => {
      const annotationFiles = this.task?.getAnnotationFiles(annotationId);
      if (!annotationFiles) throw new Error("Annotation files not found");

      const groupedFiles = this.store.editor.activeDocument?.createLayerGroup(
        annotationFiles,
        `Annotation ${idx + 1}`,
        { id: annotationId },
      );
      if (!groupedFiles) throw new Error();

      await this.store?.editor.activeDocument?.importFiles(
        groupedFiles,
        undefined,
        true,
      );
    });
  }

  // Saving
  private async generateFilesForGroup(group: ILayerGroup): Promise<File[]> {
    const annotationLayers = group.layers.filter(
      (layer) => layer.kind === "image" && layer.isAnnotation,
    ) as ImageLayer[];

    const layerFiles = await Promise.all(
      annotationLayers.map(async (layer: IImageLayer) => {
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
    return layerFiles;
  }
}
