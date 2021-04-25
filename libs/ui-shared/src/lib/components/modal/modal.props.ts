import type React from "react";
import type { ModalPositionConfig } from "./utils";

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<ModalPositionConfig, "parentElement" | "position" | "distance"> {
  labelTx?: string;
  label?: string;

  /** If set to `false`, hides the modal. */
  isOpen?: boolean;

  /**
   * If provided, a reset button is shown and this handler is called when it
   * is pressed.
   */
  onReset?: () => void;

  /**
   * If provided, this handler will be called on pointer downs outside the
   * modal.
   */
  onOutsidePress?: () => void;
}
