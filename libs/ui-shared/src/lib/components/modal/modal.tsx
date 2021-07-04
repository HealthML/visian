import React, { useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { color, fontWeight, zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { InvisibleButton } from "../button";
import { Sheet } from "../sheet";
import { Title } from "../text";
import { useOutsidePress } from "../utils";
import { ModalProps } from "./modal.props";
import { useModalPosition } from "./utils";

export const ModalHeaderButton = styled(InvisibleButton).attrs(() => ({
  isActive: false,
  tooltipPosition: "left",
}))`
  width: 16px;
  height: 16px;
`;

const ModalContainer = styled(Sheet)<Pick<ModalProps, "baseZIndex">>`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  padding: 14px;
  pointer-events: auto;

  width: 200px;
  z-index: ${(props) =>
    (props.baseZIndex === undefined
      ? (zIndex("modal")(props) as number)
      : props.baseZIndex) + 1};

  position: relative;
`;
const ModalTitle = styled(Title)`
  display: block;
  flex: 1;
  font-size: 16px;
  font-weight: ${fontWeight("regular")};
  line-height: 16px;
  user-select: none;
`;

const TitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
  width: 100%;
`;

export const Divider = styled.div<{ isHidden?: boolean }>`
  width: 100%;
  height: ${(props) => (props.isHidden ? "0px" : "1px")};
  background-color: ${color("sheetBorder")};
  border-radius: 1px;
  margin-bottom: 16px;
`;

export const ModalTitleRow: React.FC<
  Pick<ModalProps, "label" | "labelTx" | "onReset">
> = ({ children, label, labelTx, onReset }) => (
  <TitleRow>
    <ModalTitle tx={labelTx} text={label} />
    {children}
    {onReset && (
      <ModalHeaderButton
        icon="reset"
        tooltipTx="reset"
        onPointerDown={onReset}
      />
    )}
  </TitleRow>
);

export const Modal: React.FC<ModalProps> = ({
  labelTx,
  label,
  value,
  isOpen,
  hideHeaderDivider,
  children,
  headerChildren,
  anchor,
  position,
  distance,
  style,
  onOutsidePress,
  onReset,
  ...rest
}) => {
  const handleOutsidePress = useCallback(() => {
    if (onOutsidePress) onOutsidePress(value);
  }, [onOutsidePress, value]);
  const handleReset = useCallback(() => {
    if (onReset) onReset(value);
  }, [onReset, value]);

  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(ref, handleOutsidePress, isOpen);

  const modalRootRef = useModalRoot();

  const modalStyle = useModalPosition({
    anchor,
    isActive: isOpen,
    positionRelativeToOffsetParent: !modalRootRef.current,
    position,
    distance,
    style,
  });

  const node =
    isOpen === false ? null : (
      <ModalContainer {...rest} style={modalStyle} ref={ref}>
        {(labelTx || label) && (
          <>
            <ModalTitleRow
              labelTx={labelTx}
              label={label}
              onReset={onReset ? handleReset : undefined}
            >
              {headerChildren}
            </ModalTitleRow>
            <Divider isHidden={hideHeaderDivider} />
          </>
        )}
        {children}
      </ModalContainer>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
