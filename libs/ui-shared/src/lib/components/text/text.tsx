import React from "react";
import styled from "styled-components";

import { useTranslation } from "../../i18n";
import { color, font, fontSize, fontWeight } from "../../theme";
import { TextProps } from "./text.props";

const StyledSpan = styled.span<TextProps>`
  color: ${color("text")};
  font-family: ${font("default")};
  font-size: ${fontSize("default")};
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
export const Text: React.FC<TextProps> = ({
  as,
  children,
  data,
  text,
  tx,
  ...rest
}) => {
  const { t } = useTranslation();

  return (
    <StyledSpan {...rest} as={as as any}>
      {tx ? t(tx, data) : text || children}
    </StyledSpan>
  );
};
/* eslint-enable */

export const Subtitle: React.FC<Omit<
  TextProps,
  "isBold"
>> = styled(({ as, ...rest }: TextProps) => <Text {...rest} as={as || "h3"} />)`
  font-size: ${fontSize("subtitle")};
  font-weight: ${fontWeight("bold")};
`;

export const Title: React.FC<Omit<
  TextProps,
  "isBold"
>> = styled(({ as, ...rest }: TextProps) => <Text {...rest} as={as || "h2"} />)`
  font-size: ${fontSize("title")};
  font-weight: ${fontWeight("bold")};
`;

export default Text;
