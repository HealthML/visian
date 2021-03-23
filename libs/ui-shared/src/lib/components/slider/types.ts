export interface PointerCoordinates {
  clientX: number;
  clientY: number;
}

export type roundMethod = "floor" | "ceil" | "round";

export type scaleType = "linear" | "quadratic";

export interface SliderValueSettings {
  /**
   * An optional (non-linear) function applied to remap the sliders value range.
   * Defaults to `"linear"`.
   */
  scaleType?: scaleType;

  /**
   * The minimum slider value.
   * Defaults to `0`.
   */
  min?: number;

  /**
   * The maximum slider value.
   * Defaults to `1`.
   */
  max?: number;

  /**
   * An optional step size to specify discrete increments by which the slider
   * value can vary.
   * Defaults to `0`, disabling stepping and allowing continuous slider values.
   */
  stepSize?: number;

  /**
   * The method use to round slider values to the specified step size.
   * Defaults to `"round"`.
   */
  roundMethod?: roundMethod;

  /** If `true`, inverts the slider value range. */
  isInverted?: boolean;
}

export interface SliderConfig extends SliderValueSettings {
  /**
   * If `true`, rotates the slider into a vertical layout.
   * If the slider is not inverted, the slider top is mapped to the `min` value.
   */
  isVertical?: boolean;
}
