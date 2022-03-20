import type React from "react";
import type { IEnumParameterOption } from "../../types";
import type { RelativePositionConfig } from "../utils";
import type { ModalPosition } from "../modal";

export type DropDownOptionsPosition = "bottom" | "top";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DropDownOptionProps<T = any> extends IEnumParameterOption<T> {
  onChange?: (value: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DropDownOptionsProps<T = any>
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "defaultValue" | "onChange"
    >,
    Pick<
      RelativePositionConfig<DropDownOptionsPosition>,
      "anchor" | "position"
    > {
  activeIndex?: number;
  options: IEnumParameterOption<T>[];

  /** If set to `false`, hides the modal. */
  isOpen?: boolean;
  onChange?: (value: T) => void;

  /** If provided, this handler will be called when the options are dismissed. */
  onDismiss?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DropDownProps<T = any>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange"
  > {
  labelTx?: string;
  label?: string;

  infoTx?: string;
  infoPosition?: ModalPosition;
  infoBaseZIndex?: number;

  options: IEnumParameterOption<T>[];

  /**
   * The direction to expand the drop down options in.
   * Defaults to `"bottom"`.
   */
  expandTo?: DropDownOptionsPosition;

  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
}
