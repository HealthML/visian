import React from "react";
import styled from "styled-components";

import { INumberRangeParameter } from "../../types";
import { SliderField } from "../slider";

const SpacedSliderField = styled(SliderField)`
  margin-bottom: 14px;
`;

export type NumberRangeParamProps = INumberRangeParameter &
  React.HTMLAttributes<HTMLDivElement>;

export const NumberRangeParam: React.FC<NumberRangeParamProps> = ({
  extendBeyondMinMax,
  labelTx,
  label,
  min,
  max,
  scaleType,
  serializationMethod,
  stepSize,
  value,
  setValue,
  ...rest
}) => (
  <SpacedSliderField
    {...rest}
    enforceSerialThumbs={serializationMethod}
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
