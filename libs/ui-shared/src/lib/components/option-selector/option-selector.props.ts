import { IconType } from "../icon";
import { ModalPosition } from "../modal";

export interface SelectableOption<T> {
  value: T;

  label?: string;
  labelTx?: string;
  icon?: IconType;
  iconSize?: number;

  onSelected?: (value: T) => void;
}

export interface OptionSelectorProps<T = any>
  extends React.HTMLAttributes<HTMLDivElement> {
  options: SelectableOption<T>[];

  buttonIcon?: IconType;
  pannelPosition?: ModalPosition;
}
