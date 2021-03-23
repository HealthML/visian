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
}
