import styled, { keyframes } from "styled-components";

import { LoadingBlockProps } from "./loading-block.props";
import { color, radius } from "../../theme";

const pulseAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

export const LoadingBlock = styled.div<LoadingBlockProps>`
  width: 100%;
  height: ${({ height }) => height || "100%"};
  background: ${color("placeholder")};
  border-radius: ${radius("default")};
  animation: ${pulseAnimation} 2s infinite cubic-bezier(0.37, 0, 0.63, 1);
`;
