import React, { useCallback } from "react";
import styled, { css } from "styled-components";

import { Spacer } from "../box";
import { Icon } from "../icon";
import { Divider } from "../modal/modal";
import { Text } from "../text";
import { ListItemProps, ListProps } from "./list.props";

const ListContainer = styled.div`
  min-width: 200px;
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
`;

const ListDivider = styled(Divider)`
  margin-bottom: 0;
`;

export const ListItemLabel = styled(Text)`
  font-size: 14px;
  line-height: 14px;
`;

export const ListIcon = styled(Icon).withConfig({
  shouldForwardProp: (prop) =>
    prop.toString() !== "isDisabled" && prop.toString() !== "hasPressHandler",
})<{
  isDisabled?: boolean;
  hasPressHandler: boolean;
}>`
  width: 20px;
  height: 20px;
  opacity: ${(props) => (props.isDisabled ? 0.3 : 1)};
  ${(props) =>
    props.hasPressHandler &&
    css`
      cursor: pointer;
    `}
`;

export const List: React.FC<ListProps> = ({ children, ...rest }) => (
  <ListContainer {...rest}>{children}</ListContainer>
);

export const ListItem: React.FC<ListItemProps> = ({
  labelTx,
  label,
  icon,
  value,
  onIconPress,
  disableIcon,
  isLast,
  children,
  ...rest
}) => {
  const handleIconPress = useCallback(() => {
    if (onIconPress) onIconPress(value);
  }, [onIconPress, value]);

  return (
    <ListItemContainer {...rest}>
      <ListItemInner>
        {(labelTx || label) && <ListItemLabel tx={labelTx} text={label} />}
        {children}
        {icon && (
          <>
            <Spacer />
            <ListIcon
              icon={icon}
              isDisabled={disableIcon}
              onPointerDown={handleIconPress}
              hasPressHandler={Boolean(onIconPress)}
            />
          </>
        )}
      </ListItemInner>
      {!isLast && <ListDivider />}
    </ListItemContainer>
  );
};
