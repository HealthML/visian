export const getPositionWithinPixel = (
  uv: { x: number; y: number },
  scanWidth: number,
  scanHeight: number,
) => {
  const x = uv.x * scanWidth;
  const y = uv.y * scanHeight;
  const left = x - Math.trunc(x) < 0.5;
  const bottom = y - Math.trunc(y) < 0.5;
  return [left, bottom];
};
