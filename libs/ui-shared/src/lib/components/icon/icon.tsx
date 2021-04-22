import React from "react";
import styled from "styled-components";

import { color } from "../../theme";
import { IconProps } from "./icon.props";
import * as icons from "./icons";

const StyledSVG = styled.svg.withConfig({
  shouldForwardProp: (prop) => prop.toString() !== "isActive",
})<Pick<IconProps, "isActive">>`
  fill: ${color("text")};
  opacity: ${(props) => (props.isActive !== false ? 1 : 0.3)};
`;

export const Icon: React.FC<IconProps> = ({ children, icon, ...rest }) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <StyledSVG as={icons[icon] as any} {...rest}>
    {children}
  </StyledSVG>
);
