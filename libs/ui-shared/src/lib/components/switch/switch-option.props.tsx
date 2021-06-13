import { IEnumParameterOption } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SwitchOptionProps<T = any> extends IEnumParameterOption<T> {
  onChange?: (value: T) => void;
}
