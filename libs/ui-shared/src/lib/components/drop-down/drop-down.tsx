import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { sheetMixin } from "../sheet";
import { InputLabel } from "../text";
import {
  DropDownOptions,
  ExpandIcon,
  Option,
  OptionText,
} from "./drop-down-options";
import { DropDownProps } from "./drop-down.props";

const Selector = styled(Option)`
  ${sheetMixin}
  border-radius: 12px;
  position: relative;
  margin-bottom: 10px;
  width: 100%;
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
  const actualValue =
    value === undefined
      ? defaultValue === undefined
        ? options[0]?.value
        : defaultValue
      : value;
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === actualValue),
  );
  const activeOption = options[activeIndex];

  const [parentRef, setParentRef] = useState<HTMLDivElement | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const openOptions = useCallback(() => {
    setShowOptions(true);
  }, []);
  const closeOptions = useCallback(() => {
    setShowOptions(false);
  }, []);

  const setValue = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newValue: any) => {
      if (onChange) onChange(newValue);
      closeOptions();
    },
    [closeOptions, onChange],
  );

  return (
    <>
      {(labelTx || label) && <InputLabel tx={labelTx} text={label} />}
      <Selector
        {...rest}
        ref={setParentRef}
        onPointerDown={showOptions ? undefined : openOptions}
      >
        {activeOption && (
          <OptionText
            tx={activeOption.labelTx}
            text={activeOption.label || activeOption.value}
          />
        )}
        <ExpandIcon icon="arrowDown" />
        <DropDownOptions
          activeIndex={activeIndex}
          options={options}
          anchor={parentRef}
          isOpen={showOptions}
          onChange={setValue}
          onDismiss={closeOptions}
        />
      </Selector>
    </>
  );
};
