import React, { useCallback } from "react";
import styled from "styled-components";

import { InvisibleButton } from "../button";
import { Text } from "../text";
import { SwitchOptionProps } from "./switch-option.props";

const SwitchOptionContainer = styled(InvisibleButton)`
  cursor: pointer;
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwitchOptionLabel = styled(Text)`
  font-size: 12px;
  height: 12px;
`;

export const SwitchOption: React.FC<SwitchOptionProps> = ({
  labelTx,
  label,
  value,
  tooltipPosition = "bottom",
  onChange,
  ...rest
}) => {
  const changeHandler = useCallback(() => {
    if (onChange) onChange(value);
  }, [value, onChange]);

  return (
    <SwitchOptionContainer
      {...rest}
      tooltipPosition={tooltipPosition}
      onPointerDown={changeHandler}
    >
      <SwitchOptionLabel tx={labelTx} text={label || value} />
    </SwitchOptionContainer>
  );
};
