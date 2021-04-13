import type { TooltipPosition } from "../tooltip";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SwitchItemType<T = any> {
  labelTx?: string;
  label?: string;

  tooltipTx?: string;
  tooltip?: string;
  tooltipPosition?: TooltipPosition;

  value: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SwitchItemProps<T = any> extends SwitchItemType<T> {
  onChange?: (value: T) => void;
}
