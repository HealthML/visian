import type React from "react";
import type { ButtonProps } from "../button";
import type { IconType } from "../icon";
import type { ModalProps } from "../modal";

export interface ToolProps extends ButtonProps {
  isActive?: boolean;
  isDisabled?: boolean;

  /** The key of the tool's icon (if any). */
  icon?: IconType;

  /** An optional value this tool is identified by. */
  value?: string | number;

  /**
   * An optional listener that is called when the tool is pressed.
   * Will not be called if `isDisabled` is set.
   */
  onPress?: (
    value: string | number | undefined,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void;

  /**
   * An optional listener that is called when the tool is released.
   * Will not be called if `isDisabled` is set.
   */
  onRelease?: (
    value: string | number | undefined,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void;
}

export interface ToolGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<
      ModalProps,
      | "anchor"
      | "position"
      | "distance"
      | "baseZIndex"
      | "isOpen"
      | "onOutsidePress"
      | "value"
    > {
  showHint?: boolean;
  expandHint?: boolean;
  onPressHint?: () => void;
}
