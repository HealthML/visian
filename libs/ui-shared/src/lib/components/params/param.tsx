import { observer } from "mobx-react-lite";
import React from "react";

import { IParameter } from "../../types";
import { BooleanParam, BooleanParamProps } from "./boolean-param";
import { ButtonParam, ButtonParamProps } from "./button-param";
import { ColorParam, ColorParamProps } from "./color-param";
import { EnumParam, EnumParamProps } from "./enum-param";
import { NumberParam, NumberParamProps } from "./number-param";
import { NumberRangeParam, NumberRangeParamProps } from "./number-range-param";
import { ListPositionProps } from "./types";

export interface ParamProps extends ListPositionProps {
  parameter: IParameter;
}

export const Param = observer<ParamProps>(({ parameter, ...rest }) => {
  switch (parameter.kind) {
    case "bool":
      return (
        <BooleanParam
          {...rest}
          {...(parameter.toProps() as BooleanParamProps)}
        />
      );
    case "button":
      return (
        <ButtonParam {...rest} {...(parameter.toProps() as ButtonParamProps)} />
      );
    case "color":
      return (
        <ColorParam {...rest} {...(parameter.toProps() as ColorParamProps)} />
      );
    case "enum":
      return (
        <EnumParam {...rest} {...(parameter.toProps() as EnumParamProps)} />
      );
    case "number":
      return (
        <NumberParam {...rest} {...(parameter.toProps() as NumberParamProps)} />
      );
    case "number-range":
      return (
        <NumberRangeParam
          {...rest}
          {...(parameter.toProps() as NumberRangeParamProps)}
        />
      );
    default:
      return null;
  }
});
