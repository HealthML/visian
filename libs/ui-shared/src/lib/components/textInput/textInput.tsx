import React, { FormEvent, useCallback } from "react";
import styled from "styled-components";

import { useTranslation } from "../../i18n";
import { color, radius, space } from "../../theme";
import { TextInputProps } from "./textInput.props";

const StyledInput = styled.input`
  border: none;
  padding: ${space("inputPadding")};
  background-color: unset;
  border: 2px solid ${color("sheetBorder")};
  border-radius: ${radius("default")};
  color: ${color("text")};
  display: inline-flex;
`;

const TextInput: React.FC<TextInputProps> = ({
  placeholderData,
  placeholderText,
  placeholderTx,
  onEdit,
  ...rest
}) => {
  const { t } = useTranslation();
  const placeholder = placeholderTx
    ? t(placeholderTx, placeholderData)
    : placeholderText;

  const onChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      if(onEdit) {
        onEdit((event.target as HTMLInputElement).value);
      }
    },
    [onEdit],
  );

  return (
    <StyledInput
      {...rest}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default TextInput;