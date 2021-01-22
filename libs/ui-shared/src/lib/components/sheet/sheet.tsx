import styled from "styled-components";

import { FlexColumn } from "../box";
import { SheetProps } from "./sheet.props";

// Placeholder for actual implementation.
export const Sheet: React.FC<SheetProps> = styled(FlexColumn)`
  align-items: center;
  border: 2px solid rgba(170, 170, 170, 0.3);
  backdrop-filter: blur(2px);
  border-radius: 10px;
  justify-content: center;
`;

export default Sheet;
