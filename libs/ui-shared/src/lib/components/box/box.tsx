import React from "react";
import styled from "styled-components";

import { coverMixin } from "../mixins";
import { BoxProps } from "./box.props";

export const Box: React.FC<BoxProps> = styled.div``;

export const FlexColumn: React.FC<BoxProps> = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FlexRow: React.FC<BoxProps> = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Spacer: React.FC<BoxProps> = styled.div`
  flex: 1;
`;

/**
 * A container that is absolutely positioned to cover the whole area of its
 * next relatively positioned parent.
 */
export const AbsoluteCover: React.FC<BoxProps> = styled.div`
  ${coverMixin};
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default Box;
