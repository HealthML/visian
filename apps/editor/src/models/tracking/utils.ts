import { IDocument, TrackingLog } from "@visian/ui-shared";

export const readTrackingLog = (file: File, document: IDocument) =>
  new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      if (!reader.result) return reject();

      const data = JSON.parse(reader.result as string);

      if (
        !Array.isArray(data) ||
        !data.length ||
        data[0].kind !== "SESSION_START"
      ) {
        return reject();
      }

      document.importTrackingLog(data as TrackingLog);

      resolve();
    };
    reader.onerror = (error) => reject(error);
  });
