export interface SwitchItemType {
  labelTx?: string;
  label?: string;

  value: string;
}

export interface SwitchItemProps extends SwitchItemType {
  onChange?: (value: string) => void;
}
