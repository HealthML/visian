import type React from "react";
import type { ModalPositionConfig } from "./utils";

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<ModalPositionConfig, "parentElement" | "position" | "distance"> {
  labelTx?: string;
  label?: string;

  /** A reference to pass to the handlers of the modal. */
  value?: unknown;

  /** The z-index of the surface below. */
  baseZIndex?: number;

  hideHeaderDivider?: boolean;

  /** If set to `false`, hides the modal. */
  isOpen?: boolean;

  headerChildren?: React.ReactNode;

  /**
   * If provided, a reset button is shown and this handler is called when it
   * is pressed.
   */
  onReset?: (value?: unknown) => void;

  /**
   * If provided, this handler will be called on pointer downs outside the
   * modal.
   */
  onOutsidePress?: (value?: unknown) => void;
}
