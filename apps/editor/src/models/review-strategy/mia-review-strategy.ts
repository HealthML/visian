import {
  getAnnotation,
  getAnnotationsByJobAndImage,
  patchAnnotation,
} from "../../queries";
import { Image } from "mia-api-client";
import { RootStore } from "../root";
import { MiaReviewTask } from "./mia-review-task";
import { ReviewStrategy } from "./review-strategy";
import { TaskType } from "./review-task";
import { imagesApi } from "../../queries";

export class MiaReviewStrategy extends ReviewStrategy {
  public static async fromDataset(
    store: RootStore,
    datasetId: string,
    returnUrl?: string,
    taskType?: TaskType,
  ) {
    const images = await imagesApi
      .imagesControllerFindAll(datasetId)
      .then((response) => response.data);
    return new MiaReviewStrategy({ store, images, taskType, returnUrl });
  }

  public static async fromJob(
    store: RootStore,
    jobId: string,
    returnUrl?: string,
    taskType?: TaskType,
  ) {
    const images = await imagesApi
      .imagesControllerFindAll(undefined, jobId)
      .then((response) => response.data);
    return new MiaReviewStrategy({ store, images, jobId, taskType, returnUrl });
  }

  public static async fromImageIds(
    store: RootStore,
    imageIds: string[],
    returnUrl?: string,
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
      returnUrl,
    });
  }

  public static async fromAnnotationId(
    store: RootStore,
    annotationId: string,
    returnUrl?: string,
    taskType?: TaskType,
  ) {
    const annotation = await getAnnotation(annotationId);
    const image = await imagesApi
      .imagesControllerFindOne(annotation.image)
      .then((response) => response.data);
    return new MiaReviewStrategy({
      store,
      images: [image],
      allowedAnnotations: [annotationId],
      taskType,
      returnUrl,
    });
  }

  private images: Image[];
  private currentImageIndex: number;
  private jobId?: string;
  private allowedAnnotations?: Set<string>;
  private returnUrl: string;
  public taskType: TaskType;

  constructor({
    store,
    images,
    jobId,
    allowedAnnotations,
    taskType,
    returnUrl,
  }: {
    store: RootStore;
    images: Image[];
    jobId?: string;
    allowedAnnotations?: string[];
    taskType?: TaskType;
    returnUrl?: string;
  }) {
    super(store);
    this.returnUrl = returnUrl ?? "/";
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

  public async nextTask() {
    await this.saveTask();
    this.currentImageIndex += 1;
    if (this.currentImageIndex >= this.images.length) {
      await this.store?.destroyRedirect(this.returnUrl, true);
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
          return patchAnnotation(layerFamily.metaData?.id, {
            verified: layerFamily.metaData?.verified,
          });
        }
        return Promise.resolve();
      }) ?? [],
    );
  }
}
