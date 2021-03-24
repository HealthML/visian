import { zoomStep } from "../../constants";

export const getZoomStep = (zoomLevel: number) => {
  return zoomStep * Math.sqrt(zoomLevel);
};
