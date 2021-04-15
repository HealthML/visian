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
    <StyledSpan {...rest} as={as as never}>
      {tx ? t(tx, data) : text || children}
    </StyledSpan>
  );
};

export const Subtitle: React.FC<
  Omit<TextProps, "isBold">
> = styled(({ as, ...rest }: TextProps) => <Text {...rest} as={as || "h3"} />)`
  font-size: ${fontSize("subtitle")};
  font-weight: ${fontWeight("regular")};
`;

export const Title: React.FC<
  Omit<TextProps, "isBold">
> = styled(({ as, ...rest }: TextProps) => <Text {...rest} as={as || "h2"} />)`
  font-size: ${fontSize("title")};
  font-weight: ${fontWeight("regular")};
`;

export const InputLabel = styled(Text)`
  margin-bottom: 8px;
  font-size: ${fontSize("small")};
  line-height: 10px;
`;

export const SubtleText = styled(Text)`
  font-size: ${fontSize("small")};
  line-height: 10px;
  opacity: 0.3;
`;

export default Text;
