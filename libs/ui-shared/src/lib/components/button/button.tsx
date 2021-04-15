import React, { useCallback, useImperativeHandle, useState } from "react";
import styled from "styled-components";

import { fontWeight, radius, size, space } from "../../theme";
import { Icon } from "../icon";
import { sheetMixin } from "../sheet";
import { Text } from "../text";
import { Tooltip, useTooltipPosition } from "../tooltip";
import { ButtonProps } from "./button.props";

const StyledText = styled(Text)<Pick<ButtonProps, "isActive">>`
  font-weight: ${fontWeight("regular")};
  line-height: 16px;
  font-size: 16px;

  opacity: ${(props) => (props.isActive !== false ? 1 : 0.3)};
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  &:active > * {
    opacity: 1;
  }
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
      text,
      tx,
      onPointerEnter,
      onPointerLeave,
      ...rest
    },
    ref,
  ) => {
    // Tooltip Toggling
    const [showTooltip, setShowTooltip] = useState(false);
    const enterButton = useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerEnter) onPointerEnter(event);
        setShowTooltip(true);
      },
      [onPointerEnter],
    );
    const leaveButton = useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerLeave) onPointerLeave(event);
        setShowTooltip(false);
      },
      [onPointerLeave],
    );

    // Tooltip Positioning
    const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(ref, () => buttonRef!, [buttonRef]);
    const tooltipStyle = useTooltipPosition(
      buttonRef,
      tooltipPosition,
      Boolean(showTooltip && (tooltipTx || tooltip)),
    );

    return (
      <>
        <StyledButton
          {...rest}
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
  cursor: pointer;
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
