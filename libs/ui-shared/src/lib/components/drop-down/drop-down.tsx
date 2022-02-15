import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { FlexRow } from "../box";
import { InfoText } from "../info-text";

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

const LabelRow = styled(FlexRow)`
  width: 100%;
  justify-content: space-between;
`;

const StyledInfoText = styled(InfoText)`
  margin-top: -4px;
`;

export const DropDown: React.FC<DropDownProps> = ({
  labelTx,
  label,
  options,
  defaultValue,
  value,
  onChange,
  infoTx,
  infoShortcuts,
  infoPosition,
  infoBaseZIndex,
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
      {(labelTx || label) && (
        <LabelRow>
          <InputLabel tx={labelTx} text={label} />
          {infoTx && (
            <StyledInfoText
              infoTx={infoTx}
              shortcuts={infoShortcuts}
              position={infoPosition}
              baseZIndex={infoBaseZIndex}
            />
          )}
        </LabelRow>
      )}
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
