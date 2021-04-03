/**
 * Implements Bresenhams algorithm (midpoint line algorithm) to calculate
 * a line.
 *
 * Does not include the start point.
 * Does include the end point.
 *
 * @param x1 The x-coordinate of the start point of the line.
 * @param y1 The y-coordinate of the start point of the line.
 * @param x2 The x-coordinate of the end point of the line.
 * @param y2 The y-coordinate of the end point of the line.
 */
export const calculateLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  const linePixels = [];

  let x = x1;
  let y = y1;
  const dx = Math.abs(x2 - x);
  const dy = Math.abs(y2 - y);
  const sx = x < x2 ? 1 : -1;
  const sy = y < y2 ? 1 : -1;
  let err = dx - dy;

  while (!(x === x2 && y === y2)) {
    const e2 = err << 1;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }

    linePixels.push({ x, y });
  }

  return linePixels.length ? linePixels : [{ x: x2, y: y2 }];
};
