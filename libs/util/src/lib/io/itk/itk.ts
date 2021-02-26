import readImageFile from "itk/readIMageFile";
import readImageDICOMFileSeries from "itk/readImageDICOMFileSeries";

import { Zip } from "../zip";
import { ITKImage } from "./types";

/** Returns a parsed medical image from the given single file. */
export const readSingleMedicalImage = async (file: File) => {
  const { image, webWorker } = (await readImageFile(null, file)) as {
    image?: ITKImage;
    webWorker: Worker;
  };
  webWorker.terminate();

  return image;
};

/** Returns a parsed medical image from the given zipped DICOM series. */
export const readDICOMSeries = async (file: File) => {
  const zip = await Zip.fromFile(file);
  if (
    !zip.files ||
    ~zip.files.findIndex((fileName) => !fileName.endsWith(".dcm"))
  ) {
    return;
  }

  const { image, webWorkerPool } = (await readImageDICOMFileSeries(
    await zip.getAllFiles(),
  )) as {
    image?: ITKImage;
    webWorkerPool: { terminateWorkers(): void };
  };
  webWorkerPool.terminateWorkers();

  return image;
};

/**
 * Returns a parsed medical image from the given file (including zipped DICOM series).
 * Throws an error if the given file cannot be parsed.
 */
export const readMedicalImage = async (file: File) => {
  const image = await (file.name.endsWith(".zip")
    ? readDICOMSeries(file)
    : readSingleMedicalImage(file));

  if (!image) throw new Error("Could not load the given image");
  return image;
};
