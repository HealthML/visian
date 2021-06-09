import React from "react";
import styled from "styled-components";

import { fontSize } from "../../theme";
import { Icon } from "../icon";
import { sheetMixin } from "../sheet";
import { InputLabel, Text } from "../text";
import { DropDownProps } from "./drop-down.props";

const Selector = styled.div`
  ${sheetMixin}
  align-items: center;
  box-sizing: border-box;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  height: 24px;
  margin-bottom: 10px;
  width: 100%;
`;

const OptionText = styled(Text)`
  flex: 1;
  font-size: ${fontSize("small")};
  line-height: 10px;
  margin: 0 14px;
`;

const ExpandIcon = styled(Icon).attrs(() => ({ icon: "arrowDown" }))`
  height: 16px;
  margin-right: 10px;
  width: 16px;
`;

export const DropDown: React.FC<DropDownProps> = ({
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
  const activeOption =
    options.find((option) => option.value === actualValue) || options[0];

  return (
    <>
      {(labelTx || label) && <InputLabel tx={labelTx} text={label} />}
      <Selector {...rest}>
        {length && (
          <>
            <OptionText
              tx={activeOption.labelTx}
              text={activeOption.label || activeOption.value}
            />
          </>
        )}
        <ExpandIcon />
      </Selector>
    </>
  );
};
