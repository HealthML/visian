import axios from "axios";

import { Image } from "../types";
import hubBaseUrl from "./hub-base-url";

export const getImage = async (imageId: string) => {
  const imageResponse = await axios.get<Image>(
    `${hubBaseUrl}images/${imageId}`,
  );
  return imageResponse.data;
};
