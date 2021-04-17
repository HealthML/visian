import React, { useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { color, fontWeight, zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { Sheet } from "../sheet";
import { Title } from "../text";
import { useOutsidePress } from "../utils";
import { ModalProps } from "./modal.props";

const ModalContainer = styled(Sheet)`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  overflow: hidden;
  padding: 14px;
  pointer-events: auto;

  width: 200px;
  z-index: ${zIndex("modal")};
`;
const ModalTitle = styled(Title)`
  font-size: 16px;
  line-height: 16px;
  font-weight: ${fontWeight("regular")};
  margin-bottom: 12px;
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
  onOutsidePress,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(ref, onOutsidePress, isOpen);

  const modalRootRef = useModalRoot();

  const node =
    isOpen === false ? null : (
      <ModalContainer {...rest} ref={ref}>
        {(labelTx || label) && (
          <>
            <ModalTitle tx={labelTx} text={label} />
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
