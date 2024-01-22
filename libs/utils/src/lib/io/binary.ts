const GZIP_MAGIC_NUMBER = "1f8b";
const ZIP_MAGIC_NUMBER = "504b0304";

const convertToHex = (dataArray: Uint8Array): string => {
  return Array.from(dataArray, (byte) =>
    `0${(byte & 0xff).toString(16)}`.slice(-2),
  ).join("");
};

const isGzipData = (dataArray: Uint8Array): boolean => {
  const hexData = convertToHex(dataArray);
  return hexData.substring(0, 4) === GZIP_MAGIC_NUMBER;
};

const isZipData = (dataArray: Uint8Array): boolean => {
  const hexData = convertToHex(dataArray);
  return hexData.substring(0, 8) === ZIP_MAGIC_NUMBER;
};

export const createFileFromBase64 = (
  fileName: string,
  base64String: string,
) => {
  const base64Data = base64String.replace(
    "data:application/octet-stream;base64,",
    "",
  );
  const decodedData = atob(base64Data);
  const bytes = new Array(decodedData.length);
  for (let i = 0; i < decodedData.length; i++) {
    bytes[i] = decodedData.charCodeAt(i);
  }
  const binaryData = new Uint8Array(bytes);
  const fileNameForType =
    isGzipData(binaryData) && !fileName.endsWith(".gz")
      ? fileName.concat(".gz")
      : isZipData(binaryData) && !fileName.endsWith(".zip")
      ? fileName.concat(".zip")
      : fileName;
  return new File([binaryData], fileNameForType);
};

export const createBase64StringFromFile = (
  file: File,
): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
