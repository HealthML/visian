import {
  FileWithMetadata,
  getBase64DataFromFile,
  MiaAnnotation,
  MiaAnnotationMetadata,
  MiaImage,
  Zip,
} from "@visian/utils";
import { v4 as uuidv4 } from "uuid";

import { annotationsApi, getAnnotationFile, getImageFile } from "../../queries";
import { ReviewTask, TaskType } from "./review-task";

export interface MiaReviewTaskSnapshot {
  kind: TaskType;
  id: string;
  title?: string;
  description?: string;
  image: MiaImage;
  annotations: MiaAnnotation[];
}

export class MiaReviewTask extends ReviewTask {
  public static fromSnapshot(snapshot: MiaReviewTaskSnapshot) {
    return new MiaReviewTask(
      snapshot.title,
      snapshot.kind,
      snapshot.description,
      snapshot.image,
      snapshot.annotations,
      snapshot.id,
    );
  }

  public kind: TaskType;
  public id: string;
  public title: string | undefined;
  public description: string | undefined;

  public get annotationIds(): string[] {
    return [...this.annotations.keys()];
  }

  private annotations: Map<string, MiaAnnotation>;
  public image: MiaImage;

  constructor(
    title: string | undefined,
    kind: TaskType,
    description: string | undefined,
    image: MiaImage,
    annotations: MiaAnnotation[],
    id?: string,
  ) {
    super();
    this.kind = kind;
    this.id = id ?? uuidv4();
    this.title = title;
    this.description = description;
    this.image = image;
    this.annotations = new Map(annotations.map((a) => [a.id, a]));
  }

  public async getImageFiles() {
    const imageMetadata = this.image;
    const image = await getImageFile(this.image.id);
    image.metadata = {
      ...imageMetadata,
      backend: "mia",
      kind: "image",
    };
    return [await getImageFile(this.image.id)];
  }

  public async getAnnotationFiles(annotationId: string) {
    const annotationMetadata = this.annotations.get(annotationId);
    if (!annotationMetadata) {
      throw new Error(`Annotation ${annotationId} not in Task ${this.title}.`);
    }
    const annotation = await getAnnotationFile(annotationId);
    annotation.metadata = {
      ...annotationMetadata,
      backend: "mia",
      kind: "annotation",
    };
    return [annotation];
  }

  public async createAnnotation(files: File[]) {
    const file = files.length === 1 ? files[0] : await this.zipFiles(files);
    const firstFileMeta = (files[0] as FileWithMetadata | undefined)?.metadata;
    const dataUri =
      (firstFileMeta as MiaAnnotationMetadata)?.dataUri ??
      this.getAritficialAnnotationDataUri(file);

    const newAnnotation = await annotationsApi.createAnnotation({
      createAnnotationDto: {
        image: this.image.id,
        dataUri: dataUri ?? this.getAritficialAnnotationDataUri(file),
        base64File: await getBase64DataFromFile(file),
      },
    });

    this.annotations.set(newAnnotation.id, newAnnotation);
    return newAnnotation.id;
  }

  public async updateAnnotation(annotationId: string, files: File[]) {
    const annotationMetadata = this.annotations.get(annotationId);
    if (!annotationMetadata) {
      throw new Error(`Annotation ${annotationId} not in Task ${this.title}.`);
    }

    const file = files.length === 1 ? files[0] : await this.zipFiles(files);

    const updatedAnnotation = await annotationsApi.updateAnnotation({
      id: annotationMetadata.id,
      updateAnnotationDto: {
        dataUri: annotationMetadata.dataUri,
        base64File: await getBase64DataFromFile(file),
      },
    });
    this.annotations.set(updatedAnnotation.id, updatedAnnotation);
  }

  public async save() {
    return undefined;
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

  public toJSON(): MiaReviewTaskSnapshot {
    return {
      kind: this.kind,
      id: this.id,
      title: this.title,
      description: this.description,
      image: { ...this.image },
      annotations: [...this.annotations.values()].map((a) => ({ ...a })),
    };
  }
}
