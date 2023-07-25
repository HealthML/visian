import React, { useCallback, useState } from "react";
import { useTheme } from "styled-components";

import { duration, Theme } from "../../theme";
import { Tooltip } from "../tooltip";
import { useDelay, useMultiRef } from "../utils";
import { Text } from "./text";
import { TextWithTooltipProps } from "./text.props";

export const TextWithTooltip = React.forwardRef<
  HTMLSpanElement,
  TextWithTooltipProps
>(
  (
    {
      tooltip,
      tooltipTx,
      tooltipPosition,
      showTooltip: externalShowTooltip = true,
      text,
      tx,
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

    // Tooltip Delay Handling
    const [scheduleTooltipsDelay, cancelTooltipsDelay] = useDelay(
      useCallback(() => {
        theme.setShouldForceTooltip(false);
      }, [theme]),
      duration("noTooltipDelayInterval")({ theme }) as number,
    );
    const setNoTooltipDelayTimer = useCallback(() => {
      theme.setShouldForceTooltip(true);
      scheduleTooltipsDelay();
    }, [scheduleTooltipsDelay, theme]);

    const [isPointerOverText, setIsPointerOverText] = useState(false);

    const enterText = useCallback(() => {
      setIsPointerOverText(true);
      cancelTooltipsDelay();
      scheduleTooltip();
      setShowTooltip(true);
    }, [cancelTooltipsDelay, scheduleTooltip]);

    const leaveText = useCallback(() => {
      setIsPointerOverText(false);
      if ((showTooltip || theme.shouldForceTooltip) && (tooltipTx || tooltip))
        setNoTooltipDelayTimer();
      cancelTooltip();
      setShowTooltip(false);
    }, [
      setNoTooltipDelayTimer,
      cancelTooltip,
      showTooltip,
      theme.shouldForceTooltip,
      tooltipTx,
      tooltip,
    ]);

    // Tooltip Positioning
    const [textRef, setTextRef] = useState<HTMLSpanElement | null>(null);
    const updateTextRef = useMultiRef(setTextRef, ref);

    return (
      <span ref={updateTextRef}>
        <Text
          {...rest}
          text={text}
          tx={tx}
          onPointerEnter={enterText}
          onPointerLeave={leaveText}
        />
        {(tooltipTx || tooltip) && showTooltip && (
          <Tooltip
            text={tooltip ?? "default"}
            tx={tooltipTx}
            isShown={
              (showTooltip ||
                (theme.shouldForceTooltip && isPointerOverText)) &&
              externalShowTooltip
            }
            anchor={textRef}
            position={tooltipPosition}
          />
        )}
      </span>
    );
  },
);
