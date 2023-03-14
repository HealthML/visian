import axios from "axios";
import path from "path";

import { Annotation, FileWithMetadata } from "../types";
import hubBaseUrl from "./hub-base-url";
import { getAnnotation } from "./use-annotations-by";
import { getImage } from "./use-images-by";

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
  const image = await getImage(imageId);
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
  const annotation = await getAnnotation(annotationId);
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
  annotation: Annotation,
  file: File,
): Promise<Annotation> => {
  const apiEndpoint = `${hubBaseUrl}annotations/${annotation.id}`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dataUri", annotation.dataUri);
  const response = await axios.patch(apiEndpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const postAnnotationFile = async (
  imageId: string,
  annotationUri: string,
  file: File,
): Promise<Annotation> => {
  const apiEndpoint = `${hubBaseUrl}annotations`;
  const formData = new FormData();
  formData.append("image", imageId);
  formData.append("dataUri", annotationUri);
  formData.append("file", file);
  const response = await axios.post(apiEndpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
