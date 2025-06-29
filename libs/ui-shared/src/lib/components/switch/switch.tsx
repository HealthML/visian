import React from "react";
import styled from "styled-components";

import { color } from "../../theme";
import { FlexRow, InputContainer } from "../box";
import { InfoText } from "../info-text";
import { Sheet } from "../sheet";
import { InputLabel } from "../text";
import { SwitchOption } from "./switch-option";
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

const ActiveSwitchOption = styled(Sheet)`
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

const LabelRow = styled(FlexRow)`
  justify-content: space-between;
`;

const StyledInfoText = styled(InfoText)`
  margin-top: -4px;
`;

export const Switch: React.FC<SwitchProps> = ({
  labelTx,
  label,
  infoTx,
  infoShortcuts,
  infoPosition,
  infoBaseZIndex,
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
      {(labelTx || label) && (
        <LabelRow>
          <InputLabel tx={labelTx} text={label} />
          {(infoTx || infoShortcuts) && (
            <StyledInfoText
              infoTx={infoTx}
              shortcuts={infoShortcuts}
              position={infoPosition}
              baseZIndex={infoBaseZIndex}
            />
          )}
        </LabelRow>
      )}
      <SwitchContainer>
        {length && (
          <>
            <ActiveSwitchOption
              style={{
                width: `${100 / length}%`,
                left: `${(100 / length) * activeIndex}%`,
              }}
            />
            {options.map((item) => (
              <SwitchOption key={item.value} onChange={onChange} {...item} />
            ))}
          </>
        )}
      </SwitchContainer>
    </InputContainer>
  );
};
