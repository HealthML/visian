export const textToBlob = (text: string): Blob =>
  new Blob([text], {
    type: "text/plain;charset=utf-8",
  });

export const blobToText = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(blob);
  });
