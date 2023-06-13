import React, { useCallback, useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import { color, radius, size } from "../../theme";
import { Color } from "../color";
import { Icon } from "../icon";
import { sheetMixin } from "../sheet";
import { Text } from "../text";
import { TextInput } from "../text-input";
import { useOutsidePress } from "../utils";
import { GridItemProps } from "./grid.props";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  width: 100%;
  height: 100%;
  align-content: flex-start;
`;

const GridItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 230px;
  background-color: ${color("sheet")};
  border-radius: 5%;
  cursor: pointer;
  margin: 10px;
`;

const GridItemInner = styled.div<
  Pick<GridItemProps, "isActive" | "innerHeight">
>`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  ${(props) =>
    css`
      height: ${props.innerHeight ?? size("listElementHeight")};
    `}

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

export const GridItemLabel = styled(Text)`
  display: block;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
`;

export const GridItemInput = styled(TextInput)`
  display: block;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const GridIcon = styled(Icon).withConfig({
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

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      labelTx,
      label,
      icon,
      iconRef,
      trailingIcon,
      trailingIconRef,
      innerHeight,
      value,
      isActive,
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
      <GridItemContainer {...rest} ref={ref}>
        <GridItemInner isActive={isActive} innerHeight={innerHeight}>
          {icon &&
            (typeof icon === "string" ? (
              <GridIcon
                icon={icon}
                isDisabled={disableIcon}
                ref={iconRef as React.Ref<SVGSVGElement>}
                onPointerDown={handleIconPress}
                hasPressHandler={Boolean(onIconPress)}
              />
            ) : (
              <GridIcon
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
              <GridItemInput
                ref={labelInputRef}
                valueTx={labelTx}
                value={label}
                onChangeText={onChangeLabelText}
                onConfirm={onConfirmLabelText}
              />
            ) : (
              <GridItemLabel tx={labelTx} text={label} />
            ))}
          {children}
          {trailingIcon && (
            <GridIcon
              icon={trailingIcon}
              isDisabled={disableTrailingIcon}
              isTrailing
              ref={trailingIconRef}
              onPointerDown={handleTrailingIconPress}
              hasPressHandler={Boolean(onTrailingIconPress)}
            />
          )}
        </GridItemInner>
        {!isActive}
      </GridItemContainer>
    );
  },
);
