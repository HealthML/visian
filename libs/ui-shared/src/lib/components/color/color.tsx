import styled, { css } from "styled-components";

import { color, Theme } from "../../theme";
import { ColorProps } from "./color.props";

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
