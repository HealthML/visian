import { color } from "@visian/ui-shared";
import styled, { css } from "styled-components";

import { ColorProps } from "./color.props";

export const Color = styled.div<ColorProps>`
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => props.color};

  ${(props) =>
    props.isSelected &&
    css`
      border: 2px solid ${color("text")};
    `}
`;
