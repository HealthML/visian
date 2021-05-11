import { Pixel } from "@visian/utils";

export const getPositionWithinPixel = (
  uv: Pixel,
  scanWidth: number,
  scanHeight: number,
) => {
  const x = uv.x * scanWidth;
  const y = uv.y * scanHeight;
  const isRight = x - Math.trunc(x) < 0.5;
  const isBottom = y - Math.trunc(y) < 0.5;
  return [isRight, isBottom];
};
