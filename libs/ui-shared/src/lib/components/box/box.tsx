import React from "react";
import styled from "styled-components";

import { BoxProps } from "./box.props";

export const Box: React.FC<BoxProps> = (props) => <div {...props} />;

export const FlexColumn: React.FC<BoxProps> = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const FlexRow: React.FC<BoxProps> = styled(Box)`
  display: flex;
  flex-direction: row;
`;

export const Spacer: React.FC<BoxProps> = styled(Box)`
  flex: 1;
`;

export default Box;
