import { Histogram } from "@visian/ui-shared";
import { TypedArray } from "@visian/utils";

/**
 * Returns bin-wise frequency information.
 *
 * @param data The data to produce frequency information for.
 * @param bins The number of bins.
 * @param limitPositive Whether or not to limit the values in the histogram to positive values. Defaults to `true`.
 * @param quadratic Whether or not to scale the histogram bars quatratically. Defaults to `true`.
 * @param limitDominatingBin Whether or not to limit the largest bin to 2 times the second largest value. Defaults to `true`.
 * @returns [frequencyArray, minFrequency, maxFrequency]
 */
export const generateHistogram = (
  data: number[] | TypedArray,
  bins = 100,
  limitPositive = true,
  quadratic = true,
  limitDominatingBin = true,
): Histogram => {
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

  if (limitDominatingBin) {
    const first = histogram.reduce((a, b) => Math.max(a, b));
    const second = histogram.reduce(
      (a, b) => (b === first ? a : Math.max(a, b)),
      0,
    );

    if (first > 2 * second) {
      histogram = histogram.map((value) =>
        value === first ? second * 2 : value,
      );
    }
  }

  return [
    histogram,
    histogram.reduce((a, b) => Math.min(a, b)),
    histogram.reduce((a, b) => Math.max(a, b)),
  ];
};
