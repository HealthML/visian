import React from "react";
import styled from "styled-components";

import { INumberParameter } from "../../types";
import { SliderField } from "../slider";

const SpacedSliderField = styled(SliderField)`
  margin-bottom: 14px;
`;

export type NumberParamProps = INumberParameter & {
  onStart?: () => void;
  onEnd?: () => void;
  onValueLabelChange?: (value: number) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const NumberParam: React.FC<Partial<NumberParamProps>> = ({
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
  onBeforeValueChange,
  kind,
  name,
  getHistogram,
  ...rest
}) => (
  <SpacedSliderField
    {...rest}
    labelTx={labelTx}
    label={label}
    min={min}
    max={max}
    scaleType={scaleType}
    showValueLabel
    stepSize={stepSize}
    unlockValueLabelRange={extendBeyondMinMax}
    value={value}
    histogram={getHistogram?.()}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange={setValue as any}
  />
);
