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
import { WHOReviewTask } from "./who-review-task";

export class WHOReviewStrategy extends ReviewStrategy {
  public async nextTask(): Promise<void> {
    await this.saveTask();
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
    }
  }

  public async saveTask(): Promise<void> {
    const groups = this.store.editor.activeDocument?.layers.filter(
      (annotationLayer) => annotationLayer.kind === "group",
    ) as ILayerGroup[];
    if (!groups) return;

    await Promise.all(
      groups.map(async (groupLayer: ILayerGroup) => {
        const annotationId = groupLayer.metaData?.id;
        const annotationFiles = await this.getFilesForGroup(groupLayer);
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

    const undefinedGroupLayers =
      this.store.editor.activeDocument?.annotationLayers.filter(
        (annotationLayer) => annotationLayer.parent === undefined,
      );
    if (!undefinedGroupLayers) return;
    const files = await this.getFilesForLayers(undefinedGroupLayers);
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
  private async getFilesForGroup(group: ILayerGroup): Promise<File[]> {
    const annotationLayers = group.layers.filter(
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
