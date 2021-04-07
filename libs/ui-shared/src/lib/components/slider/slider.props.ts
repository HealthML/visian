import type React from "react";
import type {
  serializationMethod,
  SliderConfig,
  SliderVerticalitySettings,
} from "./types";

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

  enforceSerialThumbs?: serializationMethod;

  /**
   * A function that is called on every slider value change.
   *
   * @param value The current slider value.
   * @param thumbId The index of the changed thumb (`0` if `value` is not an array).
   * @param thumbValue The numeric value of the changed thumb.
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
