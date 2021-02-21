import React from "react";
import styled, { css } from "styled-components";

import { color, radius, ThemeProps } from "../../theme";
import { FlexColumn } from "../box";
import noise from "./noise.png";
import { SheetProps } from "./sheet.props";

export const sheetMixin = (props: ThemeProps) => css`
  backdrop-filter: blur(50px);
  background: url(${noise}) left top repeat, ${color("sheet")};
  border: 1px solid ${color("sheetBorder")};
`;

// Placeholder for actual implementation.
export const Sheet: React.FC<SheetProps> = styled(
  ({ as, ...rest }: SheetProps) => <FlexColumn {...rest} as={as as never} />,
)`
  ${sheetMixin}

  align-items: center;
  border-radius: ${radius("default")};
  justify-content: center;
`;

export default Sheet;
