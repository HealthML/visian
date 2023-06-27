import {
  getAnnotationsByJobAndImage,
  getImagesByDataset,
  getImagesByJob,
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
  ) {
    const images = await getImagesByDataset(datasetId);
    return new MiaReviewStrategy(store, images, undefined, returnUrl);
  }

  public static async fromJob(
    store: RootStore,
    jobId: string,
    returnUrl?: string,
  ) {
    const images = await getImagesByJob(jobId);
    return new MiaReviewStrategy(store, images, jobId, returnUrl);
  }

  public static async fromImageIds(
    store: RootStore,
    imageIds: string[],
    returnUrl?: string,
  ) {
    const images = await Promise.all(
      imageIds.map(async (imageId) => getImage(imageId)),
    );
    return new MiaReviewStrategy(store, images, undefined, returnUrl);
  }

  private images: Image[];
  private currentImageIndex: number;
  private jobId?: string;
  private returnUrl: string;

  constructor(
    store: RootStore,
    images: Image[],
    jobId?: string,
    returnUrl = "/",
  ) {
    super(store);
    this.returnUrl = returnUrl;
    this.images = images;
    this.currentImageIndex = 0;
    this.jobId = jobId;
  }

  protected async buildTask(): Promise<void> {
    const currentImage = this.images[this.currentImageIndex];
    const annotations = await getAnnotationsByJobAndImage(
      this.jobId,
      currentImage.id,
    );
    const imagename = currentImage.dataUri.split("/").pop()?.split(".")[0];
    const taskTitle = `Review ${imagename}`;
    const taskDescription = `Correct the annotations of ${imagename}.`;

    this.setCurrentTask(
      new MiaReviewTask(
        taskTitle,
        TaskType.Review,
        taskDescription,
        currentImage,
        annotations,
      ),
    );
  }

  public async nextTask() {
    await this.currentTask?.save();
    this.currentImageIndex += 1;
    if (this.currentImageIndex >= this.images.length) {
      await this.store?.destroyRedirect(this.returnUrl, true);
    } else {
      await this.loadTask();
    }
  }

  public async saveTask() {
    Promise.resolve();
  }
}
