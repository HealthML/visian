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
  margin: 0 1px;
  position: relative;
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
  items,
  defaultValue,
  value,
  onChange,
  ...rest
}) => {
  const { length } = items;
  const actualValue = value || defaultValue || (length ? items[0].value : "");
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.value === actualValue),
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
            {items.map((item) => (
              <SwitchItem
                key={item.value}
                onChange={onChange}
                labelTx={item.labelTx}
                label={item.label}
                value={item.value}
              />
            ))}
          </>
        )}
      </SwitchContainer>
    </InputContainer>
  );
};
