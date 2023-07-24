const GZIP_MAGIC_NUMBER = "1f8b";

const isGzipData = (dataArray: Uint8Array) => {
  const hexData = Array.from(dataArray, (byte) =>
    `0${(byte & 0xff).toString(16)}`.slice(-2),
  ).join("");
  if (hexData.substring(0, 4) === GZIP_MAGIC_NUMBER) return true;
  return false;
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

export const getBase64DataFromFile = async (file: File): Promise<string> => {
  const base64LayerData = await createBase64StringFromFile(file);
  if (!base64LayerData || !(typeof base64LayerData === "string"))
    throw new Error("File can not be converted to base64.");
  return base64LayerData;
};
