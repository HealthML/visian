import { FileWithMetadata } from "@visian/utils";
import path from "path";

import { annotationsApi, imagesApi } from "../mia-api-client";

export const getImageFile = async (
  imageId: string,
): Promise<FileWithMetadata> => {
  const response = await imagesApi.imagesControllerFindOne(imageId);
  const image = response.data;

  const fileName: string = path.basename(image.dataUri);
  const fileResponse = await imagesApi.imagesControllerGetFile(imageId, {
    responseType: "blob",
  });
  const imageFileBlob = fileResponse.data;

  const imageFile = new File([imageFileBlob], fileName, {
    type: imageFileBlob.type,
    lastModified: Date.now(),
  }) as FileWithMetadata;
  imageFile.metadata = image;

  return imageFile;
};

export const getAnnotationFile = async (
  annotationId: string,
): Promise<FileWithMetadata> => {
  const response = await annotationsApi.annotationsControllerFindOne(
    annotationId,
  );
  const annotation = response.data;

  const fileName: string = path.basename(annotation.dataUri);
  const fileResponse = await annotationsApi.annotationsControllerGetFile(
    annotationId,
    { responseType: "blob" },
  );
  const annotationFileBlob = fileResponse.data;

  const annotationFile = new File([annotationFileBlob], fileName, {
    type: annotationFileBlob.type,
    lastModified: Date.now(),
  }) as FileWithMetadata;
  annotationFile.metadata = annotation;

  return annotationFile;
};
