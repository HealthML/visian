import { zoomStep } from "../../theme";

export const getZoomStep = (zoomLevel: number) => {
  return zoomStep * Math.sqrt(zoomLevel);
};
