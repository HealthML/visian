import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

import { useTranslation } from "../../i18n";
import { color, font, fontSize } from "../../theme";
import { Text } from "../text";
import { TextInputProps } from "./text-input.props";

const StyledInput = styled.input`
  background: none;
  border: none;
  color: ${color("text")};
  font-family: ${font("default")};
  font-size: ${fontSize("default")};
  margin: 0;
  outline: none;
  padding: 0;
  pointer-events: auto;
  width: 100%;

  &[type="number"] {
    -moz-appearance: textfield;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const StyledText = styled(Text)`
  background: none;
  border: none;
  color: ${color("text")};
  display: block;
  flex: 1;
  font-family: ${font("default")};
  font-size: ${fontSize("default")};
  margin: 0;
  outline: none;
  overflow: hidden;
  padding: 0;
  pointer-events: auto;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;
  width: 100%;
`;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      placeholderTx,
      placeholderData,
      placeholder,
      type,
      value,
      valueTx,
      defaultValue,
      isEditable = true,
      onFocus,
      onChange,
      onChangeText,
      onBlur,
      onKeyDown,
      onConfirm,
      onCancel,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [isActive, setIsActive] = useState(false);
    const [internalValue, setInternalValue] = useState<unknown>(null);

    const valueRef = useRef(value);
    valueRef.current = isActive ? internalValue : value;

    const hasBeenHandledRef = useRef(false);

    /** Activates the text input. */
    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (onFocus) onFocus(event);

        if (isActive || (!onCancel && !onConfirm)) return;
        hasBeenHandledRef.current = false;
        setInternalValue(valueRef.current);
        setIsActive(true);
        inputRef.current?.select();
      },
      [isActive, onCancel, onConfirm, onFocus],
    );

    /** Confirms the changed value. */
    const confirmEdit = useCallback(() => {
      if (!isActive) return;
      if (onConfirm) {
        const newValue =
          type === "number" ? parseFloat(valueRef.current) : valueRef.current;
        if (!(type === "number" && Number.isNaN(newValue))) {
          onConfirm(newValue);
        }
      }

      setIsActive(false);
      setInternalValue(null);
    }, [isActive, onConfirm, type]);

    /** Discards the changed value. */
    const cancelEdit = useCallback(() => {
      if (!isActive) return;
      if (onCancel) onCancel(valueRef.current);

      setIsActive(false);
      setInternalValue(null);
    }, [isActive, onCancel]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(event);
        if (onChangeText) onChangeText(event.target.value);
        if (isActive) setInternalValue(event.target.value);
      },
      [isActive, onChange, onChangeText],
    );
    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (onBlur) onBlur(event);

        if (!hasBeenHandledRef.current) confirmEdit();
        hasBeenHandledRef.current = false;
      },
      [confirmEdit, onBlur],
    );
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (onKeyDown) onKeyDown(event);

        if (!isActive) return;
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();

          confirmEdit();
          hasBeenHandledRef.current = true;
          inputRef.current?.blur();
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();

          cancelEdit();
          hasBeenHandledRef.current = true;
          inputRef.current?.blur();
        }
      },
      [cancelEdit, confirmEdit, isActive, onKeyDown],
    );

    const { t } = useTranslation();
    return isEditable ? (
      <StyledInput
        {...rest}
        placeholder={
          placeholderTx ? t(placeholderTx, placeholderData) : placeholder
        }
        type={type}
        defaultValue={defaultValue}
        value={isActive ? internalValue : valueTx ? t(valueTx) : value}
        ref={inputRef}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    ) : (
      <StyledText {...rest} tx={valueTx} text={value} />
    );
  },
);
