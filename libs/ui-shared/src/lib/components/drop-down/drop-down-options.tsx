import React, { useRef } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

import { fontSize, zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { Icon } from "../icon";
import { Divider } from "../modal";
import { sheetMixin } from "../sheet";
import { Text } from "../text";
import { useOutsidePress } from "../utils";
import {
  DropDownOptionsPosition,
  DropDownOptionsProps,
} from "./drop-down.props";
import { useOptionsPosition } from "./utils";

export const Option = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  border: 1px solid transparent;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 24px;
  overflow: hidden;
  user-select: none;

  ${(props) =>
    props.isSelected &&
    css`
      ${sheetMixin}
      border-radius: 12px;
      // TODO: This displays a border of twice the thickness when the last
      // option is selected. We should figure out a workaround to also use -1px
      // margin in the vertical direction and still not have the options shift
      // around when selecting a different one.
      margin: 0 -1px;
      padding: 1px;
    `}
`;

const ExpandedSelector = styled(Option)<{ position?: DropDownOptionsPosition }>`
  margin: ${(props) =>
    props.position === "top" ? "6px -1px -1px -1px" : "-1px -1px 6px -1px"};
`;

export const OptionText = styled(Text)`
  flex: 1 0;
  font-size: ${fontSize("small")};
  margin: 0 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OptionDivider = styled(Divider)<{ isHidden?: boolean }>`
  margin: 0 14px;
  width: auto;

  ${(props) =>
    props.isHidden &&
    css`
      background: transparent;
    `}
`;

export const ExpandIcon = styled(Icon)`
  height: 16px;
  margin-right: 10px;
  width: 16px;
`;

const Options = styled.div`
  ${sheetMixin}
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: ${zIndex("picker")};
`;

export const DropDownOptions: React.FC<DropDownOptionsProps> = ({
  activeIndex = 0,
  options,
  isOpen,
  anchor,
  position,
  style,
  onChange,
  onDismiss,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(ref, onDismiss, isOpen);

  const modalRootRef = useModalRoot();

  const optionsStyle = useOptionsPosition({
    anchor,
    position,
    isActive: isOpen,
    positionRelativeToOffsetParent: !modalRootRef.current,
    style,
  });

  const activeOption = options[activeIndex];
  const selector = (
    <ExpandedSelector position={position} onPointerDown={onDismiss}>
      {activeOption && (
        <OptionText
          tx={activeOption.labelTx}
          text={activeOption.label || activeOption.value}
        />
      )}
      <ExpandIcon icon="arrowUp" />
    </ExpandedSelector>
  );

  const node =
    isOpen === false ? null : (
      <Options {...rest} style={optionsStyle} ref={ref}>
        {position === "bottom" && selector}
        {options.map((option, index) => (
          <React.Fragment key={option.value}>
            <Option
              isSelected={index === activeIndex}
              onPointerDown={() => onChange?.(option.value)}
            >
              <OptionText
                tx={option.labelTx}
                text={option.label || option.value}
              />
            </Option>
            {index < options.length - 1 && (
              <OptionDivider
                isHidden={index === activeIndex || index === activeIndex - 1}
              />
            )}
          </React.Fragment>
        ))}
        {position === "top" && selector}
      </Options>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
