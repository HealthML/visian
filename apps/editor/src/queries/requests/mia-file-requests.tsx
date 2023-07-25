import { FileWithMetadata } from "@visian/utils";
import path from "path";

import { annotationsApi, imagesApi } from "../mia-api-client";

export const getImageFile = async (
  imageId: string,
): Promise<FileWithMetadata> => {
  const image = await imagesApi
    .imagesControllerFindOne(imageId)
    .then((response) => response.data);
  const fileName: string = path.basename(image.dataUri);
  const imageFile = (await imagesApi
    .imagesControllerGetFile(imageId, { responseType: "blob" })
    .then((response) => response.data)
    .then(
      (blob) =>
        new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now(),
        }),
    )) as FileWithMetadata;
  imageFile.metadata = image;
  return imageFile;
};

export const getAnnotationFile = async (
  annotationId: string,
): Promise<FileWithMetadata> => {
  const annotation = await annotationsApi
    .annotationsControllerFindOne(annotationId)
    .then((response) => response.data);
  const fileName: string = path.basename(annotation.dataUri);
  const annotationFile = (await annotationsApi
    .annotationsControllerGetFile(annotationId, { responseType: "blob" })
    .then((response) => response.data)
    .then(
      (blob) =>
        new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now(),
        }),
    )) as FileWithMetadata;
  annotationFile.metadata = annotation;
  return annotationFile;
};
