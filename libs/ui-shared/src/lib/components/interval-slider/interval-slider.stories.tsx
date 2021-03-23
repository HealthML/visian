import React, { useCallback, useState } from "react";

import IntervalSlider from "./interval-slider";
import { IntervalSliderProps } from "./interval-slider.props";

export default {
  cmponent: IntervalSlider,
  title: "IntervalSlider",
  argTypes: {
    onChange: { action: "onChange" },
    roundMethod: {
      control: {
        type: "select",
        options: ["floor", "ceil", "round"],
      },
    },
    scaleType: {
      control: {
        type: "select",
        options: ["linear", "quadratic"],
      },
    },
  },
};

const Template = ({ onChange, ...args }: IntervalSliderProps) => {
  const [value, setValue] = useState<[number, number]>(
    args.defaultValue || [0, 0],
  );
  const changeHandler = useCallback(
    (value: [number, number]) => {
      setValue(value);
      if (onChange) onChange(value);
    },
    [onChange],
  );

  return <IntervalSlider {...args} value={value} onChange={changeHandler} />;
};

export const primary = (args: IntervalSliderProps) => Template(args);
primary.args = {
  defaultValue: [0, 5],
  min: 0,
  max: 10,
  stepSize: 0,
  isInverted: false,
  isVertical: false,
};
