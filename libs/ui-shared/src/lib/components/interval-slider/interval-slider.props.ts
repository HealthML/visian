import type { SliderProps } from "../slider";

export interface IntervalSliderProps
  extends Omit<
    SliderProps,
    "defaultValue" | "value" | "onChange" | "shouldShowLabel" | "formatLabel"
  > {
  defaultValue?: [number, number];
  value?: [number, number];

  onChange?: (value: [number, number]) => void;
}
