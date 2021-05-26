import React, { useCallback } from "react";
import styled, { css } from "styled-components";
import { Color } from "../color";

import { Icon } from "../icon";
import { Divider } from "../modal/modal";
import { Text } from "../text";
import { ListItemProps, ListProps } from "./list.props";

const ListContainer = styled.div`
  min-width: 200px;
  width: 100%;
`;

const ListItemContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItemInner = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 40px;
  overflow: hidden;
`;

const ListDivider = styled(Divider)`
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

export const ListFirstIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  margin-right: 10px;
  background-color: #d0c068;
  cursor: pointer;
`;

export const List: React.FC<ListProps> = ({ children, ...rest }) => (
  <ListContainer {...rest}>{children}</ListContainer>
);

export const ListItem: React.FC<ListItemProps> = ({
  labelTx,
  label,
  icon,
  iconRef,
  trailingIcon,
  trailingIconRef,
  value,
  onIconPress,
  onTrailingIconPress,
  disableIcon,
  disableTrailingIcon,
  isLast,
  children,
  ...rest
}) => {
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

  return (
    <ListItemContainer {...rest}>
      <ListItemInner>
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
              as={Color}
              color={icon.color}
              isDisabled={disableIcon}
              ref={iconRef as React.Ref<HTMLDivElement>}
              onPointerDown={handleIconPress}
              hasPressHandler={Boolean(onIconPress)}
            />
          ))}
        {(labelTx || label) && <ListItemLabel tx={labelTx} text={label} />}
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
      {!isLast && <ListDivider />}
    </ListItemContainer>
  );
};
