import React from "react";

import { ButtonProps } from "../button";
import { IconType } from "../icon";
import { ModalProps } from "../modal";

export interface InfoTextProps
  extends Omit<ButtonProps, "tooltipPosition" | "isActive">,
    Pick<ModalProps, "baseZIndex" | "position"> {
  titleTx?: string;

  infoTx?: string;
  infoText?: string;

  shortcuts?: React.ReactNode;

  icon?: IconType;

  /**
   * If set to `true`, the dismiss handler will be called on pointer downs
   * outside the modal.
   *
   * Defaults to `true`.
   */
  shouldDismissOnOutsidePress?: boolean;
}
