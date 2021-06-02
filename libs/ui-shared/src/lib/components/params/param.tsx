import React from "react";

import { IParameter } from "../../types";
import { BooleanParam, BooleanParamProps } from "./boolean-param";
import { NumberParam, NumberParamProps } from "./number-param";
import { NumberRangeParam, NumberRangeParamProps } from "./number-range-param";

export type ParamProps = IParameter;

export const Param: React.FC<ParamProps> = (props) => {
  switch (props.kind) {
    case "bool":
      return <BooleanParam {...(props as BooleanParamProps)} />;
    case "number":
      return <NumberParam {...(props as NumberParamProps)} />;
    case "number-range":
      return <NumberRangeParam {...(props as NumberRangeParamProps)} />;
    default:
      return null;
  }
};
