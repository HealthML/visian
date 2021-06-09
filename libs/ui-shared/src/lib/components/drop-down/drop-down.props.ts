import { IEnumParameterOption } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DropDownOptionProps<T = any> extends IEnumParameterOption<T> {
  onChange?: (value: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DropDownProps<T = any>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange"
  > {
  labelTx?: string;
  label?: string;

  options: IEnumParameterOption<T>[];

  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
}
