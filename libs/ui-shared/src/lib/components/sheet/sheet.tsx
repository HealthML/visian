import styled, { css } from "styled-components";
import { color, radius, ThemeProps } from "../../theme";

import { FlexColumn } from "../box";
import { SheetProps } from "./sheet.props";

import noise from "./noise.png";

export const sheetMixin = (props: ThemeProps) => css`
  backdrop-filter: blur(75px);
  background: url(${noise}) left top repeat, ${color("sheet")};
  border: 2px solid ${color("sheetBorder")};
`;

// Placeholder for actual implementation.
export const Sheet: React.FC<SheetProps> = styled(FlexColumn)`
  ${sheetMixin}

  align-items: center;
  border-radius: ${radius("default")};
  justify-content: center;
`;

export default Sheet;
