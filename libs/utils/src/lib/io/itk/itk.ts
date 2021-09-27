import readImageDICOMFileSeries from "itk/readImageDICOMFileSeries";
import readImageFile from "itk/readImageFile";
import writeImageArrayBuffer from "itk/writeImageArrayBuffer";

import { Zip } from "../zip";

import type { ITKImage } from "./types";

/** Returns a parsed medical image from the given single file. */
export const readSingleMedicalImage = async (file: File) => {
  const { image, webWorker } = await readImageFile(null, file);
  webWorker.terminate();

  return image;
};

/**
 * Returns a parsed medical image from the given file (including zipped DICOM series).
 * Throws an error if the given file cannot be parsed.
 */
/** Returns a parsed medical image from the given single file. */
export const writeSingleMedicalImage = async (
  image: ITKImage,
  fileName: string = image.name || "image.nii",
  useCompression = true,
) => {
  const { arrayBuffer, webWorker } = await writeImageArrayBuffer(
    null,
    useCompression,
    image,
    fileName,
  );
  webWorker.terminate();

  return arrayBuffer ? new File([arrayBuffer], fileName) : undefined;
};

/** Returns a parsed medical image from the given DICOM series. */
export const readDICOMSeries = async (files: File[]) => {
  const { image, webWorkerPool } = await readImageDICOMFileSeries(files);
  webWorkerPool.terminateWorkers();

  return image;
};

/** Returns a parsed medical image from the given zipped DICOM series. */
export const readZippedMedicalImage = async (file: File) => {
  const zip = await Zip.fromZipFile(file);
  if (
    !zip.files ||
    ~zip.files.findIndex((fileName) => !fileName.endsWith(".dcm"))
  ) {
    return;
  }

  return readDICOMSeries(await zip.getAllFiles());
};

/**
 * Returns a parsed medical image from the given file (including zipped DICOM series).
 * Throws an error if the given file cannot be parsed.
 */
export const readMedicalImage = async (file: File | File[]) => {
  try {
    const image = Array.isArray(file)
      ? await readDICOMSeries(file)
      : await (file.name.endsWith(".zip")
          ? readZippedMedicalImage(file)
          : readSingleMedicalImage(file));

    if (!image) throw new Error("image-loading-error");
    return image;
  } catch {
    throw new Error("image-loading-error");
  }
};
