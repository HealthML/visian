import React from "react";
import styled from "styled-components";

import { Text } from "../text";
import { ListProps } from "./list.props";
import { Icon } from "../icon";
import { Divider } from "../modal/modal";

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

const Spacer = styled.div`
  flex: 1;
`;

const ListItemLabel = styled(Text)`
  font-size: 14px;
  line-height: 14px;
`;

const ListIcon = styled(Icon)<Omit<ListProps, "icon">>`
  width: 20px;
  height: 20px;
  opacity: ${(props) => (props.isActive ? 1 : 0.3)};
`;

export const List: React.FC<ListProps> = ({ children, ...rest }) => (
  <ListContainer {...rest}>{children}</ListContainer>
);

export const ListItem: React.FC<ListProps> = ({
  labelTx,
  label,
  icon,
  ...rest
}) => {
  return (
    <ListItemContainer>
      <ListItemInner>
        <ListItemLabel tx={labelTx} text={label} />
        <Spacer />
        <ListIcon icon={icon} />
      </ListItemInner>
      <Divider />
    </ListItemContainer>
  );
};
