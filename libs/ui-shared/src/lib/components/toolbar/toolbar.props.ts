import type React from "react";
import type { ButtonProps } from "../button";
import type { IconType } from "../icon";

export interface ToolProps extends ButtonProps {
  isActive?: boolean;
  isDisabled?: boolean;

  /** The key of the tool's icon (if any). */
  icon?: IconType;

  /** An optional value this tool is identified by. */
  value?: string | number;

  /**
   * When passing the identifier of the currently active tool, this one will
   * appear as active if it has the same value.
   */
  activeTool?: string | number;

  /**
   * An optional listener that is called when the tool is pressed.
   * Will not be called if `isDisabled` is set.
   */
  onPress?: (
    value: string | number | undefined,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void;
}

export interface ToolbarProps {
  children?: React.ReactNode;
}
