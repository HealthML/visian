import { IDocument, TrackingLog } from "@visian/ui-shared";

export const readTrackingLog = (file: File, document: IDocument) =>
  new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      if (!reader.result) return reject(new Error("unsupported-json-error"));

      const data = JSON.parse(reader.result as string);

      if (
        !Array.isArray(data) ||
        !data.length ||
        data[0].kind !== "SESSION_START"
      ) {
        return reject(new Error("unsupported-json-error"));
      }

      try {
        document.importTrackingLog(data as TrackingLog);
      } catch (error) {
        reject(error);
      }

      resolve();
    };
    reader.onerror = (error) => reject(error);
  });
