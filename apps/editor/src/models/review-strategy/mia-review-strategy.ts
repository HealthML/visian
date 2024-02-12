import { MiaAnnotationMetadata, MiaImage } from "@visian/utils";

import {
  getAnnotation,
  getAnnotationsByJobAndImage,
  getImagesByDataset,
  getImagesByJob,
  patchAnnotation,
} from "../../queries";
import { getImage } from "../../queries/get-image";
import { RootStore } from "../root";
import { MiaReviewTask } from "./mia-review-task";
import { ReviewStrategy } from "./review-strategy";
import {
  MiaReviewStrategySnapshot,
  ReviewStrategySnapshot,
} from "./review-strategy-snapshot";
import { TaskType } from "./review-task";

export class MiaReviewStrategy extends ReviewStrategy {
  public static fromSnapshot(
    store: RootStore,
    snapshot?: ReviewStrategySnapshot,
  ) {
    if (!snapshot) return undefined;
    if (snapshot.backend === "mia") {
      return new MiaReviewStrategy({
        store,
        images: snapshot.images ?? [],
        jobId: snapshot.jobId,
        allowedAnnotations: snapshot.allowedAnnotations,
        taskType: snapshot.taskType,
        currentReviewTask: snapshot.currentReviewTask
          ? MiaReviewTask.fromSnapshot(snapshot.currentReviewTask)
          : undefined,
      });
    }
    return undefined;
  }

  public static async fromDataset(
    store: RootStore,
    datasetId: string,
    taskType?: TaskType,
  ) {
    const images = await getImagesByDataset(datasetId);
    return new MiaReviewStrategy({ store, images, taskType });
  }

  public static async fromJob(
    store: RootStore,
    jobId: string,
    taskType?: TaskType,
  ) {
    const images = await getImagesByJob(jobId);
    return new MiaReviewStrategy({ store, images, jobId, taskType });
  }

  public static async fromImageIds(
    store: RootStore,
    imageIds: string[],
    taskType?: TaskType,
    allowedAnnotations?: string[],
  ) {
    const images = await Promise.all(
      imageIds.map(async (imageId) => getImage(imageId)),
    );
    return new MiaReviewStrategy({
      store,
      images,
      allowedAnnotations,
      taskType,
    });
  }

  public static async fromAnnotationId(
    store: RootStore,
    annotationId: string,
    taskType?: TaskType,
  ) {
    const annotation = await getAnnotation(annotationId);
    const image = await getImage(annotation.image);
    return new MiaReviewStrategy({
      store,
      images: [image],
      allowedAnnotations: [annotationId],
      taskType,
    });
  }

  private images: MiaImage[];
  private currentImageIndex: number;
  private jobId?: string;
  private allowedAnnotations?: Set<string>;
  public taskType: TaskType;

  constructor({
    store,
    images,
    jobId,
    allowedAnnotations,
    taskType,
    currentReviewTask,
  }: {
    store: RootStore;
    images: MiaImage[];
    jobId?: string;
    allowedAnnotations?: string[];
    taskType?: TaskType;
    currentReviewTask?: MiaReviewTask;
  }) {
    super({ store });
    if (currentReviewTask) this.setCurrentTask(currentReviewTask);
    this.images = images;
    this.currentImageIndex = 0;
    this.jobId = jobId;
    this.allowedAnnotations = allowedAnnotations
      ? new Set(allowedAnnotations)
      : undefined;
    this.taskType = taskType ?? TaskType.Review;
  }

  protected async buildTask(): Promise<void> {
    const currentImage = this.images[this.currentImageIndex];
    const annotations = await getAnnotationsByJobAndImage(
      this.jobId,
      currentImage.id,
    );

    this.setCurrentTask(
      new MiaReviewTask(
        undefined,
        this.taskType,
        undefined,
        currentImage,
        this.allowedAnnotations
          ? annotations.filter((annotation) =>
              this.allowedAnnotations?.has(annotation.id),
            )
          : annotations,
        currentImage.id,
      ),
    );
  }

  public get supportsPreviousTask() {
    return true;
  }

  public async previousTask() {
    await this.saveTask();
    this.currentImageIndex -= 1;
    if (this.currentImageIndex < 0) {
      await this.store?.redirectToReturnUrl({});
    } else {
      await this.loadTask();
    }
  }

  public async nextTask() {
    await this.saveTask();
    this.currentImageIndex += 1;
    if (this.currentImageIndex >= this.images.length) {
      await this.store?.redirectToReturnUrl({});
    } else {
      await this.loadTask();
    }
  }

  public async saveTask() {
    await this.currentTask?.save(this.getDocument());
    await Promise.all(
      this.store.editor.activeDocument?.annotationGroups?.map((group) => {
        if (
          this.currentTask?.annotationIds.includes(group.metadata?.id ?? "")
        ) {
          return patchAnnotation(group.metadata?.id, {
            verified: (group.metadata as MiaAnnotationMetadata)?.verified,
          });
        }
        return Promise.resolve();
      }) ?? [],
    );
  }

  public async importAnnotations(): Promise<void> {
    await this.importAnnotationsWithMetadata(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public loadTaskPostProcessing(): void {}

  public toJSON() {
    return {
      backend: "mia",
      images: this.images.map((image) => ({ ...image })),
      jobId: this.jobId,
      allowedAnnotations: this.allowedAnnotations
        ? [...this.allowedAnnotations]
        : undefined,
      taskType: this.taskType,
      currentReviewTask: this.currentTask
        ? (this.currentTask as MiaReviewTask).toJSON()
        : undefined,
    } as MiaReviewStrategySnapshot;
  }
}
