import path from "path";
import hubBaseUrl from "./hub-base-url";
import { Annotation, Image } from "../types";

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

export const fetchImage = async (image: Image): Promise<File> => {
  const fileName: string = path.basename(image.dataUri);
  return fetchFile(image.id, "images", fileName);
};

export const fetchAnnotation = async (
  annotation: Annotation,
): Promise<File> => {
  const fileName: string = path.basename(annotation.dataUri);
  return fetchFile(annotation.id, "annotations", fileName);
};
