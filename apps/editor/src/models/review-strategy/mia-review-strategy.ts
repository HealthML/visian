import {
  getAnnotationsByJobAndImage,
  getImagesByDataset,
  getImagesByJob,
  patchAnnotation,
} from "../../queries";
import { getImage } from "../../queries/get-image";
import { Image } from "../../types";
import { RootStore } from "../root";
import { MiaReviewTask } from "./mia-review-task";
import { ReviewStrategy } from "./review-strategy";
import { TaskType } from "./review-task";

export class MiaReviewStrategy extends ReviewStrategy {
  public static async fromDataset(
    store: RootStore,
    datasetId: string,
    returnUrl?: string,
    taskType?: TaskType,
  ) {
    const images = await getImagesByDataset(datasetId);
    return new MiaReviewStrategy(store, images, undefined, taskType, returnUrl);
  }

  public static async fromJob(
    store: RootStore,
    jobId: string,
    returnUrl?: string,
    taskType?: TaskType,
  ) {
    const images = await getImagesByJob(jobId);
    return new MiaReviewStrategy(store, images, jobId, taskType, returnUrl);
  }

  public static async fromImageIds(
    store: RootStore,
    imageIds: string[],
    returnUrl?: string,
    taskType?: TaskType,
  ) {
    const images = await Promise.all(
      imageIds.map(async (imageId) => getImage(imageId)),
    );
    return new MiaReviewStrategy(store, images, undefined, taskType, returnUrl);
  }

  private images: Image[];
  private currentImageIndex: number;
  private jobId?: string;
  private returnUrl: string;
  public taskType: TaskType;

  constructor(
    store: RootStore,
    images: Image[],
    jobId?: string,
    taskType?: TaskType,
    returnUrl = "/",
  ) {
    super(store);
    this.returnUrl = returnUrl;
    this.images = images;
    this.currentImageIndex = 0;
    this.jobId = jobId;
    this.taskType = taskType ?? TaskType.Review;
  }

  protected async buildTask(): Promise<void> {
    const currentImage = this.images[this.currentImageIndex];
    const annotations = await getAnnotationsByJobAndImage(
      this.jobId,
      currentImage.id,
    );
    const imagename = currentImage.dataUri.split("/").pop()?.split(".")[0];
    const taskTitle = `${this.taskType} ${imagename}`;
    const taskDescription = `${this.taskType} the annotations of ${imagename}.`;

    this.setCurrentTask(
      new MiaReviewTask(
        taskTitle,
        this.taskType,
        taskDescription,
        currentImage,
        annotations,
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
