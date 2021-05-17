export type ViewMode = "2D" | "3D";

export type ScaleType = "linear" | "quadratic";

/**
 * A pseudo type alias used to indicate that this value holds a reference to
 * another object that should be resolved under the hood.
 */
export type Reference<T> = T;
