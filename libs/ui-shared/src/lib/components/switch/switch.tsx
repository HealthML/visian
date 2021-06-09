import React from "react";
import styled from "styled-components";

import { color } from "../../theme";
import { InputContainer } from "../box";
import { Sheet } from "../sheet";
import { InputLabel } from "../text";
import { SwitchItem } from "./switch-item";
import { SwitchProps } from "./switch.props";

const SwitchContainer = styled.div`
  border-radius: 12px;
  box-shadow: 0px 0px 0px 1px ${color("sheetBorder")};
  flex-direction: row;
  height: 24px;
  margin: 0px 1px 18px 1px;
  position: relative;
  pointer-events: auto;
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActiveSwitchItem = styled(Sheet)`
  height: 100%;
  transition: left 0.5s;
  position: absolute;
  border-radius: 12px;
  border: none;
  box-shadow: 0px 0px 0px 1px #6d6f76;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Switch: React.FC<SwitchProps> = ({
  labelTx,
  label,
  options,
  defaultValue,
  value,
  onChange,
  ...rest
}) => {
  const { length } = options;
  const actualValue =
    value === undefined
      ? defaultValue === undefined
        ? length
          ? options[0].value
          : ""
        : defaultValue
      : value;
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === actualValue),
  );

  return (
    <InputContainer {...rest}>
      {(labelTx || label) && <InputLabel tx={labelTx} text={label} />}
      <SwitchContainer>
        {length && (
          <>
            <ActiveSwitchItem
              style={{
                width: `${100 / length}%`,
                left: `${(100 / length) * activeIndex}%`,
              }}
            />
            {options.map((item) => (
              <SwitchItem key={item.value} onChange={onChange} {...item} />
            ))}
          </>
        )}
      </SwitchContainer>
    </InputContainer>
  );
};
