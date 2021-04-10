import React from "react";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  labelTx?: string;
  label?: string;

  /** If set to `false`, hides the modal. */
  isOpen?: boolean;

  /**
   * If provided, this handler will be called on pointer downs outside the
   * modal.
   */
  onOutsidePress?: () => void;
}
