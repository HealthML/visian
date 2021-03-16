import { AbsoluteCover } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

import { UIOverlayProps } from "./ui-overlay.props";

const Container = styled(AbsoluteCover)`
  align-items: flex-start;
  padding: 12px;
  z-index: 1;
  pointer-events: none;
  user-select: none;
`;

export const UIOverlay: React.FC<UIOverlayProps> = (props) => (
  <Container {...props} />
);

export default UIOverlay;
