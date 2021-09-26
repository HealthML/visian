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

  // TODO: Find out whether file is zipped or not
  const fileNameZip = fileName.concat(".gz");
  return new File([binaryData], fileNameZip);
};

export const createBase64StringFromFile = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
