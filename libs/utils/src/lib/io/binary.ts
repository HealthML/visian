export const createFileFromBase64 = (
  fileName: string,
  base64Data: string,
  isZipped = true,
) => {
  const decodedData = atob(base64Data);
  const bytes = new Array(decodedData.length);
  for (let i = 0; i < decodedData.length; i++) {
    bytes[i] = decodedData.charCodeAt(i);
  }
  const binaryData = new Uint8Array(bytes);

  return new File([binaryData], fileName, {
    type: isZipped ? "application/x-gzip" : "",
  });
};
