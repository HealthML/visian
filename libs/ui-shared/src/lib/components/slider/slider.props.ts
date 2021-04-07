import type React from "react";
import type { SliderConfig, SliderVerticalitySettings } from "./types";

export interface ThumbProps extends SliderVerticalitySettings {
  /**
   * A [0, 1]-ranged value indicating the thumb's relative position along the
   * slider's main axis.
   */
  position: number;
}

export interface SliderProps<T extends number | number[] = number | number[]>
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "onChange" | "defaultValue"
    >,
    SliderConfig {
  defaultValue?: T;
  value?: T;

  /**
   * A function that is called on every slider value change.
   *
   * @param value The current slider value.
   */
  onChange?: (value: T, thumbId: number, thumbValue: number) => void;

  /**
   * If `true`, shows a label with the current slider value.
   */
  shouldShowLabel?: boolean;

  /**
   * An optional function that formats the label text (if `shouldShowLabel` is `true`).
   * Defaults to a transformation to a value rounded to 2 decimal places.
   */
  formatLabel?: (value: number) => string;
}
