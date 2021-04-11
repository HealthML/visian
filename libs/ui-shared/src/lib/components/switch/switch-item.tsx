import React, { useCallback } from "react";
import styled from "styled-components";

import { Text } from "../text";
import { SwitchItemProps } from "./switch-item.props";

const SwitchItemContainer = styled.div`
  cursor: pointer;
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwitchItemLabel = styled(Text)`
  font-size: 12px;
  line-height: 12px;
`;

export const SwitchItem: React.FC<SwitchItemProps> = ({
  labelTx,
  label,
  value,
  onChange,
  ...rest
}) => {
  const changeHandler = useCallback(() => {
    if (onChange) onChange(value);
  }, [value, onChange]);

  return (
    <SwitchItemContainer {...rest} onPointerDown={changeHandler}>
      <SwitchItemLabel tx={labelTx} text={label || value} />
    </SwitchItemContainer>
  );
};
