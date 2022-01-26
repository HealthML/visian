import type { IconType, ButtonProps } from "@visian/ui-shared";
import { ModalProps } from "../modal";

export interface Shortcut {
  icons: IconType[];
  tx?: string;
  text?: string;
}

export interface InfoTextProps
  extends Omit<ButtonProps, "tooltipPosition" | "isActive">,
    Pick<ModalProps, "baseZIndex" | "position"> {
  titleTx?: string;

  infoTx?: string;
  infoText?: string;

  shortcuts?: Shortcut[];

  icon?: IconType;

  /**
   * If set to `true`, the dismiss handler will be called on pointer downs
   * outside the modal.
   *
   * Defaults to `true`.
   */
  shouldDismissOnOutsidePress?: boolean;
}
