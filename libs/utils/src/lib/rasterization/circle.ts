/**
 * Uses the midpoint circle algorithm to calculate the border of the circle
 * and fills it in according to @param fill.
 *
 * @param radius The radius of the circle. 0 returns a single pixel.
 * @param fill Determains if the circle should be filled or only
 * a two pixel thick border.
 */
export const calculateCircle = (radius: number, fill: boolean) => {
  if (radius === 0) {
    return [{ x: 0, y: 0 }];
  }
  if (radius === 0.5) {
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ];
  }
  const circlePixels = [];

  // Decision variable for picking the next pixel.
  // + 0.5 because we want the circle to be centered on a pixel.
  let d = 1 - (radius + 0.5);
  // The midpoint circle algorithm works around x=0 and y=0.
  // We add the target offset to every pixel we draw.
  let x = 0;
  let y = radius;

  // Calculate the (x, y)-coordinates of the top-right octant of the circle.
  while (x <= y) {
    // Loop through the column below the border or the two pixel thick border
    // depending on @param fill.
    for (let i = fill ? x : y - Math.min(radius, 1); i <= y; i++) {
      // Draw the pixel in all 8 symmetric octants of the circle.
      circlePixels.push(
        { x, y: i },
        { x: i, y: x },
        { x: -x, y: i },
        { x: -i, y: x },
        { x: -x, y: -i },
        { x: -i, y: -x },
        { x, y: -i },
        { x: i, y: -x },
      );
    }

    // Decide if the next pixel of the border is East or South-East.
    // Adjust d accordingly.
    if (d <= 0) {
      d += 2 * x + 3;
    } else {
      // + 0.5 because we want the circle to be centered on a pixel.
      d += 2 * (x - (y + 0.5)) + 5;
      y--;
    }
    x++;
  }

  return circlePixels;
};
