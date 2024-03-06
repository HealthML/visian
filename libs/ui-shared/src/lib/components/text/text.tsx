import React from "react";
import styled, { StyledComponentProps } from "styled-components";

import { TextProps } from "./text.props";
import { useTranslation } from "../../i18n";
import { color, font, fontSize, fontWeight, Theme } from "../../theme";

const StyledSpan = styled.span`
  color: ${color("text")};
  font-family: ${font("default")};
  font-size: ${fontSize("default")};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Text: React.FC<
  StyledComponentProps<"span", Theme, TextProps, never>
> = ({ as, children, data, text, tx, ...rest }) => {
  const { t } = useTranslation();

  return (
    <StyledSpan {...rest} as={as as never}>
      {tx ? t(tx, data) : text || children}
    </StyledSpan>
  );
};

export const Subtitle = styled(({ as, ...rest }: TextProps) => (
  <Text {...rest} as={as || "h3"} />
))`
  font-size: ${fontSize("subtitle")};
  font-weight: ${fontWeight("regular")};
`;

export const SectionHeader = styled(Subtitle)`
  font-size: ${fontSize("navigation")};
`;

export const Title = styled(({ as, ...rest }: TextProps) => (
  <Text {...rest} as={as || "h2"} />
))`
  font-size: ${fontSize("title")};
  font-weight: ${fontWeight("regular")};
`;

export const TitleLabel = styled(({ as, ...rest }: TextProps) => (
  <Text {...rest} as={as || "h3"} />
))`
  font-size: ${fontSize("default")};
  font-weight: ${fontWeight("regular")};
  opacity: 0.5;
`;

export const InputLabel = styled(Text)`
  margin-bottom: 10px;
  font-size: ${fontSize("small")};
  line-height: 10px;
`;

export const SubtleText = styled(Text)`
  font-size: ${fontSize("small")};
  line-height: 10px;
  opacity: 0.3;
`;

export default Text;
