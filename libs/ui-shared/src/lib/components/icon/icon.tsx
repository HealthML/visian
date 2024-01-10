import React from "react";
import styled from "styled-components";

import { IconProps } from "./icon.props";
import * as icons from "./icons";
import { color, opacity } from "../../theme";

const StyledSVG = styled.svg.withConfig({
  shouldForwardProp: (prop) =>
    prop.toString() !== "isActive" && prop.toString() !== "color",
})<Pick<IconProps, "isActive">>`
  fill: ${(
    props, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => color((props.color as any) || "text")};
  opacity: ${(props) =>
    props.isActive !== false ? 1 : opacity("inactiveIcon")};
`;

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ children, icon, ...rest }, ref) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <StyledSVG as={icons[icon] as any} {...rest} ref={ref}>
      {children}
    </StyledSVG>
  ),
);
