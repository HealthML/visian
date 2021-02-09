import React from "react";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  defaultValue?: number;
  inverted?: boolean;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  step?: number;
  vertical?: boolean;
  value?: number;
}
