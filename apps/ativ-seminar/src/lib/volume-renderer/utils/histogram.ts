import { TypedArray } from "@visian/utils";

/**
 * Returns bin-wise frequency information.
 *
 * @param data The data to produce frequency information for.
 * @param bins The number of bins.
 * @returns [frequencyArray, minFrequency, maxFrequency]
 */
export const generateHistogram = (
  data: number[] | TypedArray,
  bins = 100,
  limitPositive = true,
  quadratic = true,
): [number[], number, number] => {
  let min = (data as number[]).reduce((a, b) => Math.min(a, b));
  if (limitPositive) min = Math.max(0, min);
  const max = (data as number[]).reduce((a, b) => Math.max(a, b));

  let histogram = new Array(bins).fill(0);
  data.forEach((value: number) => {
    histogram[
      value === max
        ? bins - 1
        : limitPositive && value < 0
        ? 0
        : Math.floor(((value - min) / (max - min)) * bins)
    ] += 1;
  });

  if (quadratic) {
    histogram = histogram.map((value) => Math.sqrt(value));
  }
  return [
    histogram,
    histogram.reduce((a, b) => Math.min(a, b)),
    histogram.reduce((a, b) => Math.max(a, b)),
  ];
};
