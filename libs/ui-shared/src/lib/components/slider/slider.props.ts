import React from "react";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  defaultValue?: number;

  /** If `true`, inverts the slider value range. */
  isInverted?: boolean;

  /**
   * The maximum slider value.
   * Defaults to `99`.
   */
  max?: number;

  /**
   * The minimum slider value.
   * Defaults to `0`.
   */
  min?: number;

  /**
   * A function that is called on every slider value change.
   *
   * @param value The current slider value.
   */
  onChange?: (value: number) => void;

  /**
   * An optional step size to specify discrete increments by which the slider
   * value can vary.
   * Defaults to `0`, disabling stepping and allowing continuous slider values.
   */
  stepSize?: number;

  /**
   * If `true`, rotates the slider into a vertical layout.
   * If the slider is not inverted, the slider top is mapped to the `min` value.
   */
  isVertical?: boolean;

  value?: number;
}
