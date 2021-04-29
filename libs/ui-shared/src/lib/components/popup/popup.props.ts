import React from "react";

export interface PopUpProps extends React.HTMLAttributes<HTMLDivElement> {
  titleTx?: string;
  title?: string;

  secondaryTitleTx?: string;
  secondaryTitle?: string;

  /**
   * If set to `true`, the pop is placed on a dark underlay.
   * Defaults to `true`.
   */
  showUnderlay?: boolean;

  /** If set to `false`, hides the modal. */
  isOpen?: boolean;

  /**
   * If provided, this handler will be called on pointer downs outside the
   * modal.
   */
  onOutsidePress?: () => void;
}
