import React, { useMemo } from "react";

import { ILayerParameter } from "../../types";
import { DropDown } from "../drop-down";

export type LayerParamProps = ILayerParameter &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">;

export const LayerParam: React.FC<
  Partial<LayerParamProps> & Pick<LayerParamProps, "layerOptions">
> = ({
  labelTx,
  label,
  filter,
  layerOptions,
  value,
  setValue,

  defaultValue,
  onBeforeValueChange,
  kind,
  name,
  ...rest
}) => {
  const options = useMemo(
    () =>
      layerOptions.map((layer) => ({ label: layer.title, value: layer.id })),
    [layerOptions],
  );

  return (
    <DropDown
      {...rest}
      labelTx={labelTx}
      label={label}
      options={options}
      value={value}
      onChange={setValue}
    />
  );
};
