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

  /** Handler to dismiss the pop up. */
  dismiss?: () => void;

  /**
   * If set to `true`, the dismiss handler will be called on pointer downs
   * outside the modal.
   */
  shouldDismissOnOutsidePress?: boolean;

  childrenBefore?: React.ReactNode;
}

export interface StatefulPopUpProps {
  isOpen?: boolean;
  onClose?: () => void;
}
