import React from "react";
import styled from "styled-components";

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

export const ListItemLabel = styled(Text)`
  font-size: 14px;
  line-height: 14px;
`;

export const ListIcon = styled(Icon)<{ disabled?: boolean }>`
  width: 20px;
  height: 20px;
  opacity: ${(props) => (props.disabled ? 0.3 : 1)};
`;

export const List: React.FC<ListProps> = ({ children, ...rest }) => (
  <ListContainer {...rest}>{children}</ListContainer>
);

export const ListItem: React.FC<ListItemProps> = ({
  labelTx,
  label,
  icon,
  iconDisabled,
  lastItem,
  children,
  ...rest
}) => {
  return (
    <ListItemContainer>
      <ListItemInner>
        {(labelTx || label) && <ListItemLabel tx={labelTx} text={label} />}
        {children}
        {icon && (
          <>
            <Spacer />
            <ListIcon icon={icon} disabled={iconDisabled} />
          </>
        )}
      </ListItemInner>
      {!lastItem && <Divider />}
    </ListItemContainer>
  );
};
