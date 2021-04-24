import React from "react";
import styled, { StyledComponentProps } from "styled-components";

import { useTranslation } from "../../i18n";
import { color, font, fontSize, fontWeight, Theme } from "../../theme";
import { TextProps } from "./text.props";

const StyledSpan = styled.span<TextProps>`
  color: ${color("text")};
  font-family: ${font("default")};
  font-size: ${fontSize("default")};
`;

export const Text: React.FC<
  StyledComponentProps<"span", Theme, TextProps, never>
> = ({ children, data, text, tx, ...rest }) => {
  const { t } = useTranslation();

  return (
    <StyledSpan {...rest}>{tx ? t(tx, data) : text || children}</StyledSpan>
  );
};

export const Subtitle: React.FC<
  Omit<StyledComponentProps<"span", Theme, TextProps, never>, "isBold">
> = styled(Text).attrs((props) => ({ as: props.as || "h3" }))`
  font-size: ${fontSize("subtitle")};
  font-weight: ${fontWeight("regular")};
`;

export const Title: React.FC<
  Omit<StyledComponentProps<"span", Theme, TextProps, never>, "isBold">
> = styled(Text).attrs((props) => ({ as: props.as || "h2" }))`
  font-size: ${fontSize("title")};
  font-weight: ${fontWeight("regular")};
`;

export const InputLabel = styled(Text)`
  margin-bottom: 10px;
  font-size: ${fontSize("small")};
  line-height: 10px;
`;

export const SliderLabel = styled(Text)`
  margin-bottom: 6px;
  font-size: ${fontSize("small")};
  line-height: 10px;
`;

export const SubtleText = styled(Text)`
  font-size: ${fontSize("small")};
  line-height: 10px;
  opacity: 0.3;
`;

export default Text;
