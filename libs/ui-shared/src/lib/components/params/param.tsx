import React from "react";
import { IParameter } from "../../types";
import { NumberParam, NumberParamProps } from "./number-param";
import { NumberRangeParam, NumberRangeParamProps } from "./number-range-param";

export type ParamProps = IParameter;

export const Param: React.FC<ParamProps> = (props) => {
  switch (props.kind) {
    case "number":
      return <NumberParam {...(props as NumberParamProps)} />;
    case "number-range":
      return <NumberRangeParam {...(props as NumberRangeParamProps)} />;
    default:
      return null;
  }
};
