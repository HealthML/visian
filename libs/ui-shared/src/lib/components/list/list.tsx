import React, { useCallback, useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import { radius, size } from "../../theme";
import { Color } from "../color";
import { Icon } from "../icon";
import { Divider } from "../modal/modal";
import { sheetMixin } from "../sheet";
import { Text } from "../text";
import { TextInput } from "../text-input";
import { useOutsidePress } from "../utils";
import { ListItemProps } from "./list.props";

export const List = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  outline: none;
`;

const ListItemInner = styled.div<Pick<ListItemProps, "isActive">>`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${size("listElementHeight")};
  overflow: hidden;

  ${(props) =>
    props.isActive &&
    css`
      ${sheetMixin};
      border-radius: ${radius("activeLayerBorderRadius")};
      margin: 0 -${radius("activeLayerBorderRadius")};
      // Accounting for the 1px border that was added
      padding: 0 7px;
    `}
`;

export const ListDivider = styled(Divider)`
  margin-bottom: 0;
`;

export const ListItemLabel = styled(Text)`
  display: block;
  flex: 1;
  font-size: 14px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
`;

export const ListItemInput = styled(TextInput)`
  display: block;
  flex: 1;
  font-size: 14px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const ListIcon = styled(Icon).withConfig({
  shouldForwardProp: (prop) =>
    prop.toString() !== "isDisabled" &&
    prop.toString() !== "isTrailing" &&
    prop.toString() !== "hasPressHandler",
})<{
  isDisabled?: boolean;
  isTrailing?: boolean;
  hasPressHandler: boolean;
}>`
  width: 20px;
  height: 20px;
  ${(props) =>
    props.isTrailing
      ? css`
          margin-left: 10px;
        `
      : css`
          margin-right: 10px;
        `}
  opacity: ${(props) => (props.isDisabled ? 0.3 : 1)};
  ${(props) =>
    props.hasPressHandler &&
    css`
      cursor: pointer;
    `}
`;

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      labelTx,
      label,
      icon,
      iconRef,
      trailingIcon,
      trailingIconRef,
      value,
      isActive,
      isLast,
      isLabelEditable = false,
      onChangeLabelText,
      onConfirmLabelText,
      onIconPress,
      onTrailingIconPress,
      disableIcon,
      disableTrailingIcon,
      children,
      ...rest
    },
    ref,
  ) => {
    const handleIconPress = useCallback(
      (event: React.PointerEvent) => {
        if (onIconPress) onIconPress(value, event);
      },
      [onIconPress, value],
    );
    const handleTrailingIconPress = useCallback(
      (event: React.PointerEvent) => {
        if (onTrailingIconPress) onTrailingIconPress(value, event);
      },
      [onTrailingIconPress, value],
    );

    const labelInputRef = useRef<HTMLInputElement>(null);
    const onOutsidePress = useCallback(() => {
      labelInputRef.current?.blur();
    }, []);
    useOutsidePress(labelInputRef, onOutsidePress, isLabelEditable);

    useEffect(() => {
      if (isLabelEditable && labelInputRef.current !== document.activeElement) {
        labelInputRef.current?.focus();
      }
    });

    return (
      <ListItemContainer {...rest} ref={ref}>
        <ListItemInner isActive={isActive}>
          {icon &&
            (typeof icon === "string" ? (
              <ListIcon
                icon={icon}
                isDisabled={disableIcon}
                ref={iconRef as React.Ref<SVGSVGElement>}
                onPointerDown={handleIconPress}
                hasPressHandler={Boolean(onIconPress)}
              />
            ) : (
              <ListIcon
                as={!icon.icon ? Color : undefined}
                icon={icon.icon}
                color={icon.color}
                isDisabled={disableIcon}
                ref={iconRef as React.Ref<HTMLDivElement>}
                onPointerDown={handleIconPress}
                hasPressHandler={Boolean(onIconPress)}
              />
            ))}
          {(labelTx || label) &&
            (isLabelEditable ? (
              <ListItemInput
                ref={labelInputRef}
                valueTx={labelTx}
                value={label}
                onChangeText={onChangeLabelText}
                onConfirm={onConfirmLabelText}
              />
            ) : (
              <ListItemLabel tx={labelTx} text={label} />
            ))}
          {children}
          {trailingIcon && (
            <ListIcon
              icon={trailingIcon}
              isDisabled={disableTrailingIcon}
              isTrailing
              ref={trailingIconRef}
              onPointerDown={handleTrailingIconPress}
              hasPressHandler={Boolean(onTrailingIconPress)}
            />
          )}
        </ListItemInner>
        {!isActive && !isLast && <ListDivider />}
      </ListItemContainer>
    );
  },
);
