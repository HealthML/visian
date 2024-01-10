import React from "react";
import styled from "styled-components";

import { ListPositionProps } from "./types";
import { dataColorKeys } from "../../theme";
import { IColorParameter } from "../../types";
import { Color } from "../color";
import { List, ListDivider, ListItem } from "../list";
import { InputLabel } from "../text";

const SelectedColor = styled(List)<{ isCollapsed?: boolean }>`
  margin-bottom: ${(props) => (props.isCollapsed ? "20px" : "10px")};
`;

const ColorList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 0 10px -12px;
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
  isCollapsed,
  isFirst,
  isLast,
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
    <SelectedColor isCollapsed={isCollapsed}>
      {(!isFirst || labelTx || label) && <ListDivider />}
      {value && <ListItem icon={{ color: value }} label={value} />}
    </SelectedColor>
    {!isCollapsed && (
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
    )}
  </>
);
