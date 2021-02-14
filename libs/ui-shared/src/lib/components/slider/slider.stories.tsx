import React, {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useState,
} from "react";

import Slider from "./slider";
import { SliderProps } from "./slider.props";

export default {
  cmponent: Slider,
  title: "Slider",
  argTypes: { onChange: { action: "onChange" } },
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
  min: 0,
  max: 100,
  defaultValue: 50,
  isVertical: false,
  isInverted: false,
};

export const stepped = (args: SliderProps) => Template(args);
stepped.args = {
  stepSize: 1,
  min: 0,
  max: 10,
  defaultValue: 1,
  isVertical: false,
  isInverted: false,
};
