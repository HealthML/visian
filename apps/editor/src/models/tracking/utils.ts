import { IDocument, TrackingLog } from "@visian/ui-shared";

export const readTrackingLog = (file: File, document: IDocument) =>
  new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      // eslint-disable-next-line prefer-promise-reject-errors
      if (!reader.result) return reject("unsupported-json-error");

      const data = JSON.parse(reader.result as string);

      if (
        !Array.isArray(data) ||
        !data.length ||
        data[0].kind !== "SESSION_START"
      ) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject("unsupported-json-error");
      }

      try {
        document.importTrackingLog(data as TrackingLog);
      } catch (error) {
        reject((error as Error).message);
      }

      resolve();
    };
    reader.onerror = (error) => reject(error);
  });
