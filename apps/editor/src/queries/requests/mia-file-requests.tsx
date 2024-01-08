import {
  FileWithMetadata,
  MiaAnnotationMetadata,
  MiaImageMetadata,
  MiaJob,
} from "@visian/utils";
import path from "path";

import { annotationsApi, imagesApi, jobsApi } from "../mia-api-client";

export const getImageFile = async (
  imageId: string,
): Promise<FileWithMetadata> => {
  const imageMetadata = await imagesApi.findImage({ id: imageId });

  const fileName: string = path.basename(imageMetadata.dataUri);
  const fileBlob = await imagesApi.getImageFile({ id: imageId });

  const imageFile = new File([fileBlob], fileName, {
    type: fileBlob.type,
    lastModified: Date.now(),
  }) as FileWithMetadata;
  imageFile.metadata = imageMetadata as MiaImageMetadata;

  return imageFile;
};

export const getAnnotationFile = async (
  annotationId: string,
): Promise<FileWithMetadata> => {
  const annotationMetadata = await annotationsApi.findAnnotation({
    id: annotationId,
  });

  const fileName: string = path.basename(annotationMetadata.dataUri);
  const fileBlob = await annotationsApi.getAnnotationFile({
    id: annotationId,
  });

  const annotationFile = new File([fileBlob], fileName, {
    type: fileBlob.type,
    lastModified: Date.now(),
  }) as FileWithMetadata;
  annotationFile.metadata = annotationMetadata as MiaAnnotationMetadata;

  return annotationFile;
};

export const getJobLogText = async (job: MiaJob) => {
  let logText = "";
  if (!job.logFileUri) return logText;

  try {
    const blob = await jobsApi.getJobLogFile({ id: job.id });
    logText = await blob.text();
  } catch (e) {
    logText = "Error fetching job log file";
  }
  return logText;
};
