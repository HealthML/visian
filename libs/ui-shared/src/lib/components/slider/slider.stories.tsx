import React, { useCallback, useState } from "react";

import { Slider, SliderField } from "./slider";
import { SliderProps, SliderFieldProps } from "./slider.props";

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
    enforceSerialThumbs: {
      control: {
        type: "select",
        options: ["none", "block", "push"],
      },
    },
  },
};

const Template = ({ onChange, ...args }: SliderProps) => {
  const [value, setValue] = useState<number | number[]>(args.defaultValue || 0);
  const changeHandler = useCallback(
    (newValue: number | number[], id: number, thumbValue: number) => {
      setValue(newValue);
      if (onChange) onChange(newValue, id, thumbValue);
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

export const multi = (args: SliderProps) => Template(args);
multi.args = {
  defaultValue: [2, 8],
  min: 0,
  max: 10,
  stepSize: 0,
  isInverted: false,
  isVertical: false,
  showRange: true,
};

export const withMarkers = (args: SliderProps) => Template(args);
withMarkers.args = {
  defaultValue: 50,
  min: 1,
  max: 100,
  stepSize: 1,
  isInverted: false,
  isVertical: false,
  markers: [
    3,
    { color: "#f00", at: 50 },
    80,
    [0, 20],
    [80, 60],
    { color: "blueSheet", from: 25, to: 40 },
  ],
};

export const field = (args: SliderFieldProps) => <SliderField {...args} />;
field.args = {
  defaultValue: 5,
  min: 0,
  max: 10,
  stepSize: 0,
  isInverted: false,
  isVertical: false,
  label: "Slider",
  showValueLabel: true,
};
