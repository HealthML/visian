import React, { useState } from "react";

import Slider from "./slider";
import { SliderProps } from "./slider.props";

export default {
  cmponent: Slider,
  title: "Slider",
};

const Template = (args: SliderProps) => {
  const [value, setValue] = useState<number>(args.defaultValue || 0);

  return <Slider value={value} onChange={setValue} {...args} />;
};

export const primary = (args: SliderProps) => Template(args);
primary.args = {
  min: 0,
  max: 100,
  vertical: false,
  inverted: false,
};

export const step = (args: SliderProps) => Template(args);
step.args = {
  step: 1,
  min: 0,
  max: 10,
  defaultValue: 5,
};
