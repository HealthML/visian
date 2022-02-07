export type ViewMode = "2D" | "3D";

export type ScaleType = "linear" | "quadratic";

export type PerformanceMode = "low" | "high";

export type MeasurementType = "volume" | "area" | "length";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ValueType<T> = T extends Record<infer _K, infer V> ? V : T;

/**
 * A pseudo type alias used to indicate that this value holds a reference to
 * another object that should be resolved under the hood.
 */
export type Reference<T> = T;

export enum MergeFunction {
  Replace = 0,
  Add = 1,
  Subtract = 2,
}

/**
 * Representation of a histogam.
 *
 * The first value is an array containing the numbers of elements in each bin.
 * The second value is the number of elements in the smallest bin.
 * The third value is the number of elements in the smallest bin.
 */
export type Histogram = [number[], number, number];
