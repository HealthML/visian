import React from "react";

import { IParameter } from "../../types";
import { BooleanParam, BooleanParamProps } from "./boolean-param";
import { ButtonParam, ButtonParamProps } from "./button-param";
import { ColorParam, ColorParamProps } from "./color-param";
import { EnumParam, EnumParamProps } from "./enum-param";
import { NumberParam, NumberParamProps } from "./number-param";
import { NumberRangeParam, NumberRangeParamProps } from "./number-range-param";
import { ListPositionProps } from "./types";

export type ParamProps = IParameter & ListPositionProps;

export const Param: React.FC<ParamProps> = (props) => {
  switch (props.kind) {
    case "bool":
      return <BooleanParam {...(props as BooleanParamProps)} />;
    case "button":
      return <ButtonParam {...(props as ButtonParamProps)} />;
    case "color":
      return <ColorParam {...(props as ColorParamProps)} />;
    case "enum":
      return <EnumParam {...(props as EnumParamProps)} />;
    case "number":
      return <NumberParam {...(props as NumberParamProps)} />;
    case "number-range":
      return <NumberRangeParam {...(props as NumberRangeParamProps)} />;
    default:
      return null;
  }
};
