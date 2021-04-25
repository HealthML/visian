import styled from "styled-components";
import { zIndex } from "../../theme";

import { coverMixin } from "../mixins";
import { BoxProps } from "./box.props";

export const Box = styled.div<BoxProps>``;

export const FlexColumn = styled.div<BoxProps>`
  display: flex;
  flex-direction: column;
`;

export const FlexRow = styled.div<BoxProps>`
  display: flex;
  flex-direction: row;
`;

export const Spacer = styled.div<BoxProps>`
  flex: 1;
`;

/**
 * A container that is absolutely positioned to cover the whole area of its
 * next relatively positioned parent.
 */
export const AbsoluteCover = styled.div<BoxProps>`
  ${coverMixin};
`;

export const InputContainer = styled.div<BoxProps>`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

/** The modal root. There should only be one per application. */
export const ModalRoot = styled.div.attrs(({ theme }) => ({
  id: theme.modalRootId,
}))<BoxProps>`
  ${coverMixin};
  pointer-events: none;
  z-index: ${zIndex("modal")};
`;

export default Box;
