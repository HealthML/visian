import React, { useCallback, useState } from "react";

import Slider from "./slider";
import { SliderProps } from "./slider.props";

export default {
  cmponent: Slider,
  title: "Slider",
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

const Template = ({ onChange, ...args }: SliderProps) => {
  const [value, setValue] = useState<number>(args.defaultValue || 0);
  const changeHandler = useCallback(
    (value: number) => {
      setValue(value);
      if (onChange) onChange(value);
    },
    [onChange],
  );

  return <Slider {...args} value={value} onChange={changeHandler} />;
};

export const primary = (args: SliderProps) => Template(args);
primary.args = {
  defaultValue: 5,
  min: 0,
  max: 10,
  stepSize: 0,
  isInverted: false,
  isVertical: false,
};

export const stepped = (args: SliderProps) => Template(args);
stepped.args = {
  defaultValue: 1,
  min: 0,
  max: 10,
  stepSize: 1,
  roundMethod: "round",
  isInverted: false,
  isVertical: false,
};
