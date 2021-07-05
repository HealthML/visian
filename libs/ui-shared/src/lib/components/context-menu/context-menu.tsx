import React, { useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { List, ListItem } from "../list";
import { Sheet } from "../sheet";
import { useOutsidePress } from "../utils";
import { ContextMenuProps } from "./context-menu.props";
import { useContextMenuPosition } from "./utils";

const ContextMenuContainer = styled(Sheet)<
  Pick<ContextMenuProps, "baseZIndex">
>`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  padding: 0 14px;
  pointer-events: auto;

  width: 160px;
  z-index: ${(props) =>
    (props.baseZIndex === undefined
      ? (zIndex("modal")(props) as number)
      : props.baseZIndex) + 1};

  position: relative;
`;

export const ContextMenuItem = styled(ListItem)`
  cursor: pointer;
  height: 34px;
`;

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  children,
  anchor,
  distance,
  style,
  value,
  onOutsidePress,
  ...rest
}) => {
  const handleOutsidePress = useCallback(() => {
    if (onOutsidePress) onOutsidePress(value);
  }, [onOutsidePress, value]);

  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(ref, handleOutsidePress, isOpen);

  const modalRootRef = useModalRoot();

  const modalStyle = useContextMenuPosition({
    anchor,
    isActive: isOpen,
    positionRelativeToOffsetParent: !modalRootRef.current,
    distance,
    style,
  });

  const node =
    isOpen === false ? null : (
      <ContextMenuContainer {...rest} style={modalStyle} ref={ref}>
        <List>{children}</List>
      </ContextMenuContainer>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
