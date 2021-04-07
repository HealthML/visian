import React, { FormEvent, useCallback } from "react";
import styled from "styled-components";

import { useTranslation } from "../../i18n";
import { color, font, fontSize, radius, space } from "../../theme";
import { TextInputProps } from "./text-input.props";

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

const TextInput: React.FC<TextInputProps> = ({
  placeholderData,
  placeholder: placeholderText,
  placeholderTx,
  onChange,
  onEdit,
  ...rest
}) => {
  const { t } = useTranslation();
  const placeholder = placeholderTx
    ? t(placeholderTx, placeholderData)
    : placeholderText;

  const handleChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      if (onChange) onChange(event);
      if (onEdit) {
        onEdit((event.target as HTMLInputElement).value);
      }
    },
    [onChange, onEdit],
  );

  return (
    <StyledInput {...rest} onChange={handleChange} placeholder={placeholder} />
  );
};

export default TextInput;
