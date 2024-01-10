import styled, { css } from "styled-components";

import { ColorProps } from "./color.props";
import { color, Theme } from "../../theme";

export const Color = styled.div<ColorProps>`
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => color(props.color as keyof Theme["colors"])};

  ${(props) =>
    props.isSelected &&
    css`
      border: 2px solid ${color("text")};
    `}
`;
