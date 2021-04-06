import { Pixel } from "@visian/utils";

export const getPositionWithinPixel = (
  uv: Pixel,
  scanWidth: number,
  scanHeight: number,
) => {
  const x = uv.x * scanWidth;
  const y = uv.y * scanHeight;
  const right = x - Math.trunc(x) < 0.5;
  const bottom = y - Math.trunc(y) < 0.5;
  return [right, bottom];
};
