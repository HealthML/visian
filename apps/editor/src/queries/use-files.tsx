import {
  FileWithMetadata,
  MiaAnnotation,
  getBase64DataFromFile,
} from "@visian/utils";
import axios from "axios";
import path from "path";

import { annotationsApi, hubBaseUrl, imagesApi } from "./hub-base-url";

const fetchFile = async (
  id: string,
  endpoint: string,
  fileName: string,
): Promise<File> =>
  fetch(`${hubBaseUrl}${endpoint}/${id}/file`, {
    method: "GET",
  })
    .then((response) => response.blob())
    .then(
      (blob) =>
        new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now(),
        }),
    );

export const fetchImageFile = async (
  imageId: string,
): Promise<FileWithMetadata> => {
  const image = await imagesApi
    .imagesControllerFindOne(imageId)
    .then((response) => response.data);
  const fileName: string = path.basename(image.dataUri);
  const imageFile = (await fetchFile(
    image.id,
    "images",
    fileName,
  )) as FileWithMetadata;
  imageFile.metadata = image;
  return imageFile;
};

export const fetchAnnotationFile = async (
  annotationId: string,
): Promise<FileWithMetadata> => {
  const annotation = await annotationsApi
    .annotationsControllerFindOne(annotationId)
    .then((response) => response.data);
  const fileName: string = path.basename(annotation.dataUri);
  const annotationFile = (await fetchFile(
    annotation.id,
    "annotations",
    fileName,
  )) as FileWithMetadata;
  annotationFile.metadata = annotation;
  return annotationFile;
};

export const patchAnnotationFile = async (
  annotation: MiaAnnotation,
  file: File,
): Promise<MiaAnnotation> =>
  annotationsApi
    .annotationsControllerUpdate(annotation.id, {
      dataUri: annotation.dataUri,
      base64File: await getBase64DataFromFile(file),
    })
    .then((response) => response.data);

export const postAnnotationFile = async (
  imageId: string,
  annotationUri: string,
  file: File,
): Promise<MiaAnnotation> =>
  annotationsApi
    .annotationsControllerCreate({
      image: imageId,
      dataUri: annotationUri,
      base64File: await getBase64DataFromFile(file),
    })
    .then((response) => response.data);
