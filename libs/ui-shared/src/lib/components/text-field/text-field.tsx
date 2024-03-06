import React, { useCallback } from "react";
import styled from "styled-components";

import { TextFieldProps } from "./text-field.props";
import { useTranslation } from "../../i18n";
import { color, font, fontSize, radius, size, space } from "../../theme";

const StyledInput = styled.input`
  border: none;
  padding: ${space("inputPadding")};
  box-sizing: border-box;
  background-color: unset;
  border: 1px solid ${color("sheetBorder")};
  border-radius: ${radius("default")};
  color: ${color("text")};
  display: inline-flex;
  font-family: ${font("default")};
  font-size: ${fontSize("default")};
  height: ${size("listElementHeight")};

  &::placeholder {
    color: ${color("placeholder")};
  }

  &:focus {
    border-color: ${color("text")};
    outline: none;
  }
`;

export const TextField: React.FC<TextFieldProps> = ({
  placeholderData,
  placeholder: placeholderText,
  placeholderTx,
  onChange,
  onChangeText,
  ...rest
}) => {
  const { t } = useTranslation();
  const placeholder = placeholderTx
    ? t(placeholderTx, placeholderData)
    : placeholderText;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(event);
      if (onChangeText) {
        onChangeText((event.target as HTMLInputElement).value);
      }
    },
    [onChange, onChangeText],
  );

  return (
    <StyledInput {...rest} onChange={handleChange} placeholder={placeholder} />
  );
};
