import React, { useCallback, useRef } from "react";
import styled from "styled-components";

import { color, fontWeight } from "../../theme";
import { Sheet } from "../sheet";
import { Title } from "../text";
import { ModalProps } from "./modal.props";

const ModalContainer = styled(Sheet)`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  padding: 14px;

  width: 200px;
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
`;

export const Modal: React.FC<ModalProps> = ({
  labelTx,
  label,
  children,
  ...rest
}) => (
  <ModalContainer {...rest}>
    {(labelTx || label) && (
      <>
        <ModalTitle tx={labelTx} text={label} />
        <Divider />
      </>
    )}
    {children}
  </ModalContainer>
);
