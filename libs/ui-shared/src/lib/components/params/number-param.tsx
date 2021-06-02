import React from "react";
import styled from "styled-components";

import { INumberParameter } from "../../types";
import { SliderField } from "../slider";

const SpacedSliderField = styled(SliderField)`
  margin-bottom: 14px;
`;

export type NumberParamProps = INumberParameter &
  React.HTMLAttributes<HTMLDivElement>;

export const NumberParam: React.FC<NumberParamProps> = ({
  extendBeyondMinMax,
  labelTx,
  label,
  min,
  max,
  scaleType,
  stepSize,
  value,
  setValue,

  defaultValue,
  kind,
  name,
  ...rest
}) => (
  <SpacedSliderField
    {...rest}
    labelTx={labelTx}
    label={label}
    min={min}
    max={max}
    scaleType={scaleType}
    stepSize={stepSize}
    unlockValueLabelRange={extendBeyondMinMax}
    value={value}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange={setValue as any}
  />
);
