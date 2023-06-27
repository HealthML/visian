import { Zip } from "@visian/utils";
import { v4 as uuidv4 } from "uuid";

import {
  fetchAnnotationFile,
  fetchImageFile,
  patchAnnotationFile,
  postAnnotationFile,
} from "../../queries";
import { Annotation, Image } from "../../types";
import { ReviewTask, TaskType } from "./review-task";

export class MiaReviewTask implements ReviewTask {
  public kind: TaskType;
  public id: string;
  public title: string;
  public description: string;

  public get annotationIds(): string[] {
    return [...this.annotations.keys()];
  }

  private annotations: Map<string, Annotation>;
  private image: Image;

  constructor(
    title: string,
    kind: TaskType,
    description: string,
    image: Image,
    annotations: Annotation[],
    id?: string,
  ) {
    this.kind = kind;
    this.id = id ?? uuidv4();
    this.title = title;
    this.description = description;
    this.image = image;
    this.annotations = new Map(annotations.map((a) => [a.id, a]));
  }

  // public static async fromDataset(datasetId: string)

  public async getImageFiles() {
    return [await fetchImageFile(this.image.id)];
  }

  public async getAnnotationFiles(annotationId: string) {
    if (!this.annotations.has(annotationId)) {
      throw new Error(`Annotation ${annotationId} not in Task ${this.title}.`);
    }
    return [await fetchAnnotationFile(annotationId)];
  }
  public async createAnnotation(files: File[], dataUri?: string) {
    const file = files.length === 1 ? files[0] : await this.zipFiles(files);
    // eslint-disable-next-line no-param-reassign
    dataUri ??= this.getAritficialAnnotationDataUri(file);

    const newAnnotation = await postAnnotationFile(
      this.image.id,
      dataUri,
      file,
    );
    this.annotations.set(newAnnotation.id, newAnnotation);
  }

  public async updateAnnotation(annotationId: string, files: File[]) {
    if (!this.annotations.has(annotationId)) {
      throw new Error(`Annotation ${annotationId} not in Task ${this.title}.`);
    }

    const file = files.length === 1 ? files[0] : await this.zipFiles(files);

    const newAnnotation = await patchAnnotationFile(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.annotations.get(annotationId)!,
      file,
    );
    this.annotations.set(newAnnotation.id, newAnnotation);
  }

  public async save() {
    return {
      data: {},
      status: 1700,
      statusText: "OK",
      headers: {},
      config: {},
    };
  }

  private async zipFiles(files: File[]): Promise<File> {
    const zip = new Zip();
    files.forEach((file, index) => {
      if (!file) return;
      zip.setFile(`${`00${index}`.slice(-2)}_${file.name}`, file);
    });
    return new File([await zip.toBlob()], `mia_zip.zip`);
  }

  private getAritficialAnnotationDataUri(file: File) {
    return `${this.id}/${uuidv4()}.${file.name.split(".").slice(-1).join(".")}`;
  }
}
