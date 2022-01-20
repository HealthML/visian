import path from "path";
import { handlePromiseSettledResult } from "../async";
import { Zip } from "./zip";

export const extractSeriesFromFiles = async (
  files: File | File[],
  name?: string,
): Promise<File[][]> => {
  const series: File[][] = [];

  // Pre-filter files
  const filteredFiles = Array.isArray(files)
    ? files.filter(
        (file) =>
          !file.name.startsWith(".") &&
          file.name !== "DICOMDIR" &&
          path.extname(file.name) !== ".json",
      )
    : files;

  if (Array.isArray(filteredFiles)) {
    if (
      filteredFiles.some((file) => path.extname(file.name) !== ".dcm") &&
      filteredFiles.some((file) => path.extname(file.name) !== "")
    ) {
      // Not a single DICOM series --> Handle files individually
      handlePromiseSettledResult(
        await Promise.allSettled(
          filteredFiles.map(async (file) => {
            series.push(...(await extractSeriesFromFiles(file, name)));
          }),
        ),
      );
      return series;
    }
  } else if (filteredFiles.name.endsWith(".zip")) {
    // Extract ZIP file
    const zip = await Zip.fromZipFile(filteredFiles);
    series.push(
      ...(await extractSeriesFromFiles(
        await zip.getAllFiles(),
        filteredFiles.name,
      )),
    );
    return series;
  }

  if (!Array.isArray(filteredFiles) || filteredFiles.length) {
    // Single file or single DICOM series
    series.push(Array.isArray(filteredFiles) ? filteredFiles : [filteredFiles]);
  }
  return series;
};

export const extractSeriesFromFileSystemEntries = async (
  entries: FileSystemEntry | null | (FileSystemEntry | null)[],
): Promise<File[][]> => {
  const series: File[][] = [];

  if (!entries) return series;

  if (Array.isArray(entries)) {
    if (entries.some((entry) => entry && !entry.isFile)) {
      // Includes some directories
      handlePromiseSettledResult(
        await Promise.allSettled(
          entries.map(async (entry) => {
            series.push(...(await extractSeriesFromFileSystemEntries(entry)));
          }),
        ),
      );
    } else {
      // Includes only files
      const files = await Promise.all(
        entries.map(
          (entry) =>
            new Promise<File>((resolve, reject) => {
              (entry as FileSystemFileEntry).file((file: File) => {
                resolve(file);
              }, reject);
            }),
        ),
      );
      if (files.length) series.push(...(await extractSeriesFromFiles(files)));
    }
  } else if (entries.isDirectory) {
    // Single directory entry
    const dirReader = (entries as FileSystemDirectoryEntry).createReader();
    const subEntries: FileSystemEntry[] = [];

    // Loop over entries to avoid directory size limitation of one readEntries call
    let newSubEntries: FileSystemEntry[];
    do {
      // eslint-disable-next-line no-await-in-loop
      newSubEntries = await new Promise<FileSystemEntry[]>(
        (resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        },
      );
      subEntries.push(...newSubEntries);
    } while (newSubEntries.length);

    const dirFiles: File[] = [];
    const promises: Promise<void>[] = [];
    const { length } = subEntries;
    for (let i = 0; i < length; i++) {
      if (subEntries[i].isFile) {
        // Process file in directory
        promises.push(
          // eslint-disable-next-line no-loop-func
          new Promise((resolve, reject) => {
            (subEntries[i] as FileSystemFileEntry).file((file: File) => {
              dirFiles.push(file);
              resolve();
            }, reject);
          }),
        );
      } else {
        // Process sub directory
        promises.push(
          (async () => {
            series.push(
              ...(await extractSeriesFromFileSystemEntries(subEntries[i])),
            );
          })(),
        );
      }
    }
    // throw the corresponding error if one promise was rejected
    handlePromiseSettledResult(await Promise.allSettled(promises));

    if (dirFiles.length) {
      // Extract series from all files in directory
      series.push(...(await extractSeriesFromFiles(dirFiles, entries.name)));
    }
  } else {
    // Extract series from single file
    await new Promise<string | void>((resolve, reject) => {
      (entries as FileSystemFileEntry).file(async (file: File) => {
        try {
          series.push(...(await extractSeriesFromFiles(file)));
          resolve();
        } catch {
          reject();
        }
      }, reject);
    });
  }

  return series;
};
