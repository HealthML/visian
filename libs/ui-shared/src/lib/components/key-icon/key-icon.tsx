import React from "react";
import styled from "styled-components";

import { fontWeight } from "../../theme";
import { Sheet } from "../sheet";
import { Text } from "../text";
import { KeyIconProps } from "./key-icon.props";

const KeyIconContainer = styled(Sheet)<{ isSmall?: boolean }>`
  box-sizing: border-box;
  border-radius: 4px;
  padding: ${({ isSmall }) => (isSmall ? "2px 4px 0 4px" : "5px 8px 3px 8px")};
  min-width: ${({ isSmall }) => (isSmall ? "16px" : "24px")};
  align-items: center;
  justify-content: center;
`;

const KeyIconLabel = styled(Text)<{ isSmall?: boolean }>`
  font-size: ${({ isSmall }) => (isSmall ? "12px" : "14px")};
  line-height: ${({ isSmall }) => (isSmall ? "12px" : "14px")};
  white-space: nowrap;
  text-align: center;
  font-weight: ${fontWeight("regular")};
`;

export const KeyIcon: React.FC<KeyIconProps> = ({
  tx,
  text,
  data,
  isSmall,
  ...rest
}) => (
  <KeyIconContainer isSmall={isSmall} {...rest}>
    <KeyIconLabel isSmall={isSmall} tx={tx} text={text} data={data} />
  </KeyIconContainer>
);
