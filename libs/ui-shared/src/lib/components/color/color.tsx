import styled from "styled-components";

import { ColorProps } from "./color.props";

export const Color = styled.div<ColorProps>`
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;
