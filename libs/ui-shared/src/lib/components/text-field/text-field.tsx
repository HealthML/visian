import React, { useCallback } from "react";
import styled from "styled-components";

import { useTranslation } from "../../i18n";
import { color, font, fontSize, radius, space } from "../../theme";
import { TextFieldProps } from "./text-field.props";

const StyledInput = styled.input`
  border: none;
  padding: ${space("inputPadding")};
  background-color: unset;
  border: 1px solid ${color("sheetBorder")};
  border-radius: ${radius("default")};
  color: ${color("text")};
  display: inline-flex;
  font-family: ${font("default")};
  font-size: ${fontSize("default")};

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
