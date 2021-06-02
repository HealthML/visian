import React from "react";
import { IParameter } from "../../types";
import { NumberParam, NumberParamProps } from "./number-param";

export type ParamProps = IParameter;

export const Param: React.FC<ParamProps> = (props) => {
  switch (props.kind) {
    case "number":
      return <NumberParam {...(props as NumberParamProps)} />;
    default:
      return null;
  }
};
