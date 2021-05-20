import React, { useRef } from "react";
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

const StyledButton = styled(InvisibleButton)`
  width: 16px;
  height: 16px;
`;

const ModalContainer = styled(Sheet)<Pick<ModalProps, "baseZIndex">>`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  overflow: hidden;
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
`;

const TitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
  width: 100%;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-radius: 1px;
  background-color: ${color("sheetBorder")};
  margin-bottom: 16px;
`;

export const Modal: React.FC<ModalProps> = ({
  labelTx,
  label,
  isOpen,
  children,
  parentElement,
  position,
  distance,
  style,
  onOutsidePress,
  onReset,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(ref, onOutsidePress, isOpen);

  const modalRootRef = useModalRoot();

  const modalStyle = useModalPosition({
    parentElement,
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
            <TitleRow>
              <ModalTitle tx={labelTx} text={label} />
              {onReset && (
                <StyledButton
                  icon="reset"
                  tooltipTx="reset"
                  tooltipPosition="left"
                  isActive={false}
                  onPointerDown={onReset}
                />
              )}
            </TitleRow>
            <Divider />
          </>
        )}
        {children}
      </ModalContainer>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
