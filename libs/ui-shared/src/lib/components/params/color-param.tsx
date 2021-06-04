import React from "react";
import styled from "styled-components";

import { dataColorKeys } from "../../theme";
import { IColorParameter } from "../../types";
import { Color } from "../color";
import { List, ListDivider, ListItem } from "../list";
import { InputLabel } from "../text";
import { ListPositionProps } from "./types";

const LayerList = styled(List)`
  margin-bottom: 10px;
`;

const ColorList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-left: -12px;
`;

const StyledColor = styled(Color)`
  cursor: pointer;
  margin: 6px 0 6px 12px;
`;

export type ColorParamProps = IColorParameter &
  ListPositionProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">;

// TODO: In the future, we should probably offer a more flexible pop up color
// picker that allows user to specify fully custom colors
export const ColorParam: React.FC<Partial<ColorParamProps>> = ({
  isFirst,
  labelTx,
  label,
  value,
  setValue,

  defaultValue,
  onBeforeValueChange,
  kind,
  name,
  ...rest
}) => (
  <>
    {(labelTx || label) && <InputLabel tx={labelTx} text={label} />}
    <LayerList>
      {(!isFirst || labelTx || label) && <ListDivider />}
      {value && <ListItem icon={{ color: value }} label={value} />}
    </LayerList>
    <ColorList {...rest}>
      {dataColorKeys.map((color) => (
        <StyledColor
          key={color}
          color={color}
          isSelected={color === value}
          onPointerDown={() => setValue?.(color)}
        />
      ))}
    </ColorList>
  </>
);
