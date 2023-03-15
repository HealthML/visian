import axios from "axios";

import hubBaseUrl from "./hub-base-url";
import { Image } from "../types";

export const getImage = async (imageId: string) => {
  const imageResponse = await axios.get<Image>(
    `${hubBaseUrl}images/${imageId}`,
  );
  return imageResponse.data;
};
