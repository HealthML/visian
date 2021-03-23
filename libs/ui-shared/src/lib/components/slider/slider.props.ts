import type React from "react";
import type { SliderConfig } from "./types";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    SliderConfig {
  defaultValue?: number;
  value?: number;

  /**
   * A function that is called on every slider value change.
   *
   * @param value The current slider value.
   */
  onChange?: (value: number) => void;

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
