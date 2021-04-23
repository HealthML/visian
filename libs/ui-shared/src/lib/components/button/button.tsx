import React, { useCallback, useImperativeHandle, useState } from "react";
import styled, { css, useTheme } from "styled-components";

import { duration, fontWeight, radius, size, space, Theme } from "../../theme";
import { Icon } from "../icon";
import { sheetMixin } from "../sheet";
import { Text } from "../text";
import { Tooltip, useTooltipPosition } from "../tooltip";
import { useDelay } from "../utils";
import { ButtonProps } from "./button.props";

const StyledText = styled(Text)<Pick<ButtonProps, "isActive">>`
  font-weight: ${fontWeight("regular")};
  line-height: 16px;
  font-size: 16px;

  opacity: ${(props) => (props.isActive !== false ? 1 : 0.3)};
`;

const StyledButton = styled.button<Pick<ButtonProps, "isDisabled">>`
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;

  ${(props) =>
    props.isDisabled
      ? css`
          cursor: not-allowed;
          opacity: 0.45;
        `
      : css`
          cursor: pointer;
          &:active > * {
            opacity: 1;
          }
        `}
`;

const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      data,
      icon,
      tooltip,
      tooltipTx,
      tooltipPosition,
      showTooltip: externalShowTooltip = true,
      isActive,
      isDisabled,
      text,
      tx,
      onPointerEnter,
      onPointerLeave,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme() as Theme;

    // Tooltip Toggling
    const [showTooltip, setShowTooltip] = useState(false);
    const [scheduleTooltip, cancelTooltip] = useDelay(
      useCallback(() => {
        setShowTooltip(true);
      }, []),
      duration("tooltipDelay")({ theme }) as number,
    );
    const enterButton = useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerEnter) onPointerEnter(event);
        scheduleTooltip();
      },
      [onPointerEnter, scheduleTooltip],
    );
    const leaveButton = useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerLeave) onPointerLeave(event);
        cancelTooltip();
        setShowTooltip(false);
      },
      [cancelTooltip, onPointerLeave],
    );

    // Tooltip Positioning
    const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(ref, () => buttonRef!, [buttonRef]);
    const tooltipStyle = useTooltipPosition(
      buttonRef,
      tooltipPosition,
      Boolean(showTooltip && externalShowTooltip && (tooltipTx || tooltip)),
    );

    return (
      <>
        <StyledButton
          {...rest}
          isDisabled={isDisabled}
          onPointerEnter={enterButton}
          onPointerLeave={leaveButton}
          ref={setButtonRef}
        >
          {icon && <Icon icon={icon} isActive={isActive} />}
          {tx || text ? (
            <StyledText data={data} isActive={isActive} text={text} tx={tx} />
          ) : (
            children
          )}
        </StyledButton>
        {(tooltipTx || tooltip) && (
          <Tooltip
            style={tooltipStyle}
            text={tooltip}
            tx={tooltipTx}
            isShown={showTooltip && externalShowTooltip}
          />
        )}
      </>
    );
  },
);

export const Button = styled(BaseButton)`
  ${sheetMixin}

  border-radius: ${radius("default")};
  box-sizing: border-box;
  display: inline-flex;
  height: ${size("buttonHeight")};
  outline: none;
  padding: ${space("buttonPadding")};
  pointer-events: auto;
  user-select: none;
`;

export const SquareButton = styled(Button)`
  padding: 0;
  width: ${size("buttonHeight")};
`;

export const FloatingUIButton = styled(SquareButton)`
  margin-bottom: 16px;
`;

export const CircularButton = styled(Button)`
  border-radius: 50%;
`;

export const InvisibleButton = styled(BaseButton)`
  background: none;
  border: none;
  outline: none;
  padding: 0;

  box-sizing: border-box;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
`;

export default Button;
