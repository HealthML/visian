import React, { useRef } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

import { fontSize, size as getSize, radius, zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { Icon } from "../icon";
import { Divider } from "../modal";
import { sheetMixin } from "../sheet";
import { Text } from "../text";
import { useOutsidePress } from "../utils";
import { DropDownOptionsProps } from "./drop-down.props";
import { useOptionsPosition } from "./utils";

export const Option = styled.div<{
  isSelected?: boolean;
  size?: "small" | "medium" | "large";
}>`
  align-items: center;
  border: 1px solid transparent;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${(props) =>
    props.size === "small" ? "24px" : getSize("listElementHeight")};
  overflow: hidden;
  user-select: none;

  ${(props) =>
    props.isSelected &&
    css`
      ${sheetMixin}
      border-radius: ${radius("activeLayerBorderRadius")};
      margin: -1px -1px;
    `}
`;

const ExpandedSelector = styled(Option)`
  margin: -1px -1px 6px -1px;
`;

export const OptionText = styled(Text)<{ size?: "small" | "medium" | "large" }>`
  flex: 1 0;
  font-size: ${(props) => {
    if (props.size === "large") return fontSize("default");
    if (props.size === "medium") return fontSize("default");
    return fontSize("small");
  }};
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

export const ExpandIcon = styled(Icon)<{ size?: "small" | "medium" | "large" }>`
  height: ${(props) => {
    if (props.size === "large") return "32px";
    if (props.size === "medium") return "32px";
    return "16px";
  }};
  margin-right: 10px;
  width: ${(props) => {
    if (props.size === "large") return "32px";
    if (props.size === "medium") return "32px";
    return "16px";
  }};
`;

const Options = styled.div`
  ${sheetMixin}
  border-radius: ${radius("activeLayerBorderRadius")};
  display: block;
  flex-direction: column;
  pointer-events: auto;
  z-index: ${zIndex("overlayComponent")};
  overflow-y: auto;
  max-height: 40%;
`;

export const DropDownOptions: React.FC<DropDownOptionsProps> = ({
  activeIndex = 0,
  options,
  isOpen,
  anchor,
  style,
  onChange,
  onDismiss,
  size,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(ref, onDismiss, isOpen);

  const modalRootRef = useModalRoot();

  const optionsStyle = useOptionsPosition({
    anchor,
    isActive: isOpen,
    positionRelativeToOffsetParent: !modalRootRef.current,
    style,
  });

  const activeOption = options[activeIndex];
  const node =
    isOpen === false ? null : (
      <Options {...rest} style={optionsStyle} ref={ref}>
        <ExpandedSelector onPointerDown={onDismiss} size={size}>
          {activeOption && (
            <OptionText
              tx={activeOption.labelTx}
              text={activeOption.label || activeOption.value}
              size={size}
            />
          )}
          <ExpandIcon icon="arrowUp" size={size} />
        </ExpandedSelector>
        {options.map((option, index) => (
          <React.Fragment key={option.value}>
            <Option
              isSelected={index === activeIndex}
              onPointerDown={() => onChange?.(option.value)}
              size={size}
            >
              <OptionText
                tx={option.labelTx}
                text={option.label || option.value}
                size={size}
              />
            </Option>
            {index < options.length - 1 && (
              <OptionDivider
                isHidden={index === activeIndex || index === activeIndex - 1}
              />
            )}
          </React.Fragment>
        ))}
      </Options>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
