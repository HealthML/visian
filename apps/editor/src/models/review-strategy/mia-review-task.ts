import { Zip } from "@visian/utils";
import { v4 as uuidv4 } from "uuid";

import {
  fetchAnnotationFile,
  fetchImageFile,
  patchAnnotationFile,
  postAnnotationFile,
} from "../../queries";
import { Annotation, FileWithMetadata } from "../../types";
import { Image } from "mia-api-client";
import { ReviewTask, TaskType } from "./review-task";

export class MiaReviewTask implements ReviewTask {
  public kind: TaskType;
  public id: string;
  public title: string | undefined;
  public description: string | undefined;

  public get annotationIds(): string[] {
    return [...this.annotations.keys()];
  }

  private annotations: Map<string, Annotation>;
  public image: Image;

  constructor(
    title: string | undefined,
    kind: TaskType,
    description: string | undefined,
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

  public async getImageFiles() {
    const imageMetadata = this.image;
    const image = await fetchImageFile(this.image.id);
    image.metadata = imageMetadata;
    return [await fetchImageFile(this.image.id)];
  }

  public async getAnnotationFiles(annotationId: string) {
    const annotationMetadata = this.annotations.get(annotationId);
    if (!annotationMetadata) {
      throw new Error(`Annotation ${annotationId} not in Task ${this.title}.`);
    }
    const annotation = await fetchAnnotationFile(annotationId);
    annotation.metadata = annotationMetadata;
    return [annotation];
  }

  public async createAnnotation(files: File[]) {
    const file = files.length === 1 ? files[0] : await this.zipFiles(files);
    const dataUri =
      (files[0] as FileWithMetadata | undefined)?.metadata?.dataUri ??
      this.getAritficialAnnotationDataUri(file);
    const newAnnotation = await postAnnotationFile(
      this.image.id,
      dataUri ?? this.getAritficialAnnotationDataUri(file),
      file,
    );
    this.annotations.set(newAnnotation.id, newAnnotation);
    return newAnnotation.id;
  }

  public async updateAnnotation(annotationId: string, files: File[]) {
    const annotationMetadata = this.annotations.get(annotationId);
    if (!annotationMetadata) {
      throw new Error(`Annotation ${annotationId} not in Task ${this.title}.`);
    }

    const file = files.length === 1 ? files[0] : await this.zipFiles(files);

    const newAnnotation = await patchAnnotationFile(annotationMetadata, file);
    this.annotations.set(newAnnotation.id, newAnnotation);
  }

  public async save() {
    return new Promise((resolve) => setTimeout(resolve, 1000)) as any;
    // data: {},
    // status: 1700,
    // statusText: "OK",
    // headers: {},
    // config: {},
    // };
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
    return `${this.id}/${uuidv4()}.${file.name.split(".").slice(1).join(".")}`;
  }

  public getAnnotation(annotationId: string) {
    return this.annotations.get(annotationId);
  }
}
