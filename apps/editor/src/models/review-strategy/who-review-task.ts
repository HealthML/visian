import { FileWithMetadata } from "@visian/ui-shared";
import {
  createBase64StringFromFile,
  createFileFromBase64,
  putWHOTask,
  WHOAnnotation,
  WHOAnnotationData,
  WHOAnnotationStatus,
  WHOTask,
  WHOTaskType,
} from "@visian/utils";
import { AxiosResponse } from "axios";

import { ReviewTask, TaskType } from "./review-task";

const taskTypeMapping = {
  [WHOTaskType.Create]: TaskType.Create,
  [WHOTaskType.Correct]: TaskType.Review,
  [WHOTaskType.Review]: TaskType.Supervise,
};

export class WHOReviewTask implements ReviewTask {
  private whoTask: WHOTask;

  public get id(): string {
    return this.whoTask.taskUUID;
  }

  public get kind(): TaskType {
    return taskTypeMapping[this.whoTask.kind];
  }

  public get title(): string {
    return this.whoTask.annotationTasks[0].title;
  }

  public get description(): string {
    return this.whoTask.annotationTasks[0].description;
  }

  public get annotationIds(): string[] {
    return this.whoTask.annotations.map(
      (annotation) => annotation.annotationUUID,
    );
  }

  constructor(whoTask: WHOTask) {
    // If kind is CREATE we want to ignore all existing annotations
    if (whoTask.kind === WHOTaskType.Create) {
      whoTask.annotations = [];
    }
    this.whoTask = whoTask;
  }

  public async getImageFiles() {
    return this.whoTask.samples.map((sample) =>
      createFileFromBase64(sample?.title, sample?.data),
    );
  }

  public async getAnnotationFiles(annotationId: string) {
    const title = this.whoTask?.samples[0]?.title;
    const whoAnnotation = this.whoTask?.annotations.find(
      (annotation) => annotation.annotationUUID === annotationId,
    );
    if (!whoAnnotation) return null;

    return whoAnnotation.data.map((annotationData, idx) => {
      const file = createFileFromBase64(
        title.replace(".nii", `_annotation_${idx}`).concat(".nii"),
        annotationData.data,
      ) as FileWithMetadata;
      // The file must contain the annotationDataUUID it belongs to
      // in order to later store the modified file back to the correct
      // WHOAnnotationData object
      file.metadata = { id: annotationData.annotationDataUUID };
      return file;
    });
  }

  public async createAnnotation(files: File[]) {
    const annotationWithoutData = {
      // TODO: set correct status
      status: WHOAnnotationStatus.Completed,
      data: [],
      annotator: this.whoTask.assignee,
      submittedAt: new Date().toISOString(),
    };
    const annotation = new WHOAnnotation(annotationWithoutData);
    await Promise.all(
      files.map(async (file) => {
        const base64Data = await this.getBase64DataFromFile(file);
        this.createAnnotationData(annotation, base64Data);
      }),
    );
    this.whoTask.annotations.push(annotation);
    return annotation.annotationUUID;
  }

  public async updateAnnotation(
    annotationId: string,
    files: File[],
  ): Promise<void> {
    const annotation = this.whoTask?.annotations.find(
      (anno: WHOAnnotation) => anno.annotationUUID === annotationId,
    );
    if (!annotation)
      throw new Error(`Annotation with id ${annotationId} does not exist.`);

    await Promise.all(
      files.map(async (file) => {
        const base64Data = await this.getBase64DataFromFile(file);
        if ("metadata" in file) {
          const fileWithMetadata = file as FileWithMetadata;
          this.updateAnnotationData(
            fileWithMetadata.metadata.id,
            annotation,
            base64Data,
          );
        } else {
          this.createAnnotationData(annotation, base64Data);
        }
      }),
    );
  }

  public async save(): Promise<AxiosResponse> {
    return putWHOTask(this.id, JSON.stringify(this.whoTask.toJSON()));
  }

  private async getBase64DataFromFile(file: File): Promise<string> {
    const base64LayerData = await createBase64StringFromFile(file);
    if (!base64LayerData || !(typeof base64LayerData === "string"))
      throw new Error("File can not be converted to base64.");
    return base64LayerData;
  }

  private createAnnotationData(annotation: WHOAnnotation, base64Data: string) {
    const annotationDataForBackend = { data: base64Data };
    annotation.data.push(new WHOAnnotationData(annotationDataForBackend));
  }

  private updateAnnotationData(
    annotationDataUUID: string,
    annotation: WHOAnnotation,
    base64Data: string,
  ) {
    const annotationData = annotation.data.find(
      (annoData: WHOAnnotationData) =>
        annoData.annotationDataUUID === annotationDataUUID,
    );
    if (!annotationData) {
      throw new Error(
        `Failed to find AnnotationData with UUID ${annotationDataUUID}`,
      );
    }
    annotationData.data = base64Data;
  }
}
