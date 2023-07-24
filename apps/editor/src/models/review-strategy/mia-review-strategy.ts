import { MiaImage } from "@visian/utils";

import { annotationsApi, imagesApi } from "../../queries";
import { RootStore } from "../root";
import { MiaReviewTask } from "./mia-review-task";
import { ReviewStrategy } from "./review-strategy";
import { TaskType } from "./review-task";

export class MiaReviewStrategy extends ReviewStrategy {
  public static async fromDataset(
    store: RootStore,
    datasetId: string,
    taskType?: TaskType,
  ) {
    const images = await imagesApi
      .imagesControllerFindAll(datasetId)
      .then((response) => response.data);
    return new MiaReviewStrategy({ store, images, taskType });
  }

  public static async fromJob(
    store: RootStore,
    jobId: string,
    taskType?: TaskType,
  ) {
    const images = await imagesApi
      .imagesControllerFindAll(undefined, jobId)
      .then((response) => response.data);
    return new MiaReviewStrategy({ store, images, jobId, taskType });
  }

  public static async fromImageIds(
    store: RootStore,
    imageIds: string[],
    taskType?: TaskType,
    allowedAnnotations?: string[],
  ) {
    const images = await Promise.all(
      imageIds.map(async (imageId) =>
        imagesApi
          .imagesControllerFindOne(imageId)
          .then((response) => response.data),
      ),
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
    const annotation = await annotationsApi
      .annotationsControllerFindOne(annotationId)
      .then((response) => response.data);
    const image = await imagesApi
      .imagesControllerFindOne(annotation.image)
      .then((response) => response.data);
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
  }: {
    store: RootStore;
    images: MiaImage[];
    jobId?: string;
    allowedAnnotations?: string[];
    taskType?: TaskType;
  }) {
    super(store);
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
    const annotations = await annotationsApi
      .annotationsControllerFindAll(currentImage.id, this.jobId)
      .then((response) => response.data);

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
    await this.currentTask?.save();
    await Promise.all(
      this.store.editor.activeDocument?.layerFamilies?.map((layerFamily) => {
        if (
          this.currentTask?.annotationIds.includes(
            layerFamily.metaData?.id ?? "",
          )
        ) {
          if (layerFamily.metaData?.id) {
            return annotationsApi
              .annotationsControllerUpdate(layerFamily.metaData?.id, {
                verified: layerFamily.metaData?.verified,
              })
              .then((response) => response.data);
          }
        }
        return Promise.resolve();
      }) ?? [],
    );
  }
}
