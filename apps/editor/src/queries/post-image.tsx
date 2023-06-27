import axios from "axios";

import { hubBaseUrl } from "./hub-base-url";

export const postImage = async (
  datasetId: string,
  dataUri: string,
  imageFile: File,
) => {
  const formData = new FormData();
  formData.append("dataset", datasetId);
  formData.append("dataUri", dataUri);
  formData.append("file", imageFile);
  await axios.post(`${hubBaseUrl}images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
