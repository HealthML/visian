import { MiaImage } from "@visian/utils";
import axios from "axios";

import { hubBaseUrl } from "./hub-base-url";

export const getImage = async (imageId: string) => {
  const imageResponse = await axios.get<MiaImage>(
    `${hubBaseUrl}images/${imageId}`,
  );
  return imageResponse.data;
};
