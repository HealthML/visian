import React from "react";
import styled from "styled-components";

import { Sheet } from "../sheet";
import { Text } from "../text";
import { KeyIconProps } from "./key-icon.props";
import { fontWeight } from "../../theme";

const KeyIconContainer = styled(Sheet)`
  box-sizing: border-box;
  border-radius: 4px;
  padding: 5px 8px 3px 8px;
  min-width: 24px;
  align-items: center;
  justify-content: center;
`;

const KeyIconLabel = styled(Text)`
  font-size: 14px;
  line-height: 14px;
  white-space: nowrap;
  text-align: center;
  font-weight: ${fontWeight("regular")};
`;

export const KeyIcon: React.FC<KeyIconProps> = ({
  tx,
  text,
  data,
  ...rest
}) => (
  <KeyIconContainer {...rest}>
    <KeyIconLabel tx={tx} text={text} data={data} />
  </KeyIconContainer>
);
