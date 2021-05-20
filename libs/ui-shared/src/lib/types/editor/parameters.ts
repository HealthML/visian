import type { TooltipPosition } from "../../components";
import type { ScaleType } from "./types";

/** A generic setting that corresponds to a (procedurally rendered) UI control. */
export interface IParameter<T = unknown> {
  /** The type of parameter. Indicates the data type and UI element. */
  kind: string;

  /**
   * The parameter's name.
   * A (locally) unique identifier, typically used to access the parameter
   * from the model.
   */
  name: string;

  /**
   * The parameter's label.
   * A user-facing display name, typically used in the corresponding UI
   * element.
   */
  label?: string;
  /**
   * The label's translation key.
   * If set, overrides the `label`.
   */
  labelTx?: string;

  tooltip?: string;
  tooltipTx?: string;
  tooltipPosition?: TooltipPosition;

  /** The parameter's current value. */
  value: T;
  /** Sets the parameter's current value. */
  setValue(value: T): void;
}

/** A boolean parameter, typically displayed as a checkbox or switch. */
export interface IBooleanParameter extends IParameter<boolean> {
  kind: "bool";
}

/** A button parameter, used to invoke some action. */
export interface IButtonParameter<T = void> extends IParameter<T> {
  kind: "button";

  /** A user-defined callback that is invoked when the button is pressed. */
  onClick?: (name: string, value: T) => void;

  /** A callback that should be invoked when the button is pressed. */
  handleClick(): void;
}

/** An option that can be choosen for an enum parameter. */
export interface IEnumParameterOption<T> {
  label?: string;
  labelTx?: string;

  tooltip?: string;
  tooltipTx?: string;
  tooltipPosition?: TooltipPosition;

  value: T;
}

/** A class selection parameter, typically displayed as a select field or switch. */
export interface IEnumParameter<T> extends IParameter<T> {
  kind: "enum";

  /** The options to choose from. */
  options: IEnumParameterOption<T>[];
}

/** A numeric parameter, typically displayed as a slider. */
export interface INumberParameter extends IParameter<number> {
  kind: "number";

  /**
   * An optional (non-linear) function applied to remap the value range.
   * Defaults to `"linear"`.
   */
  scaleType?: ScaleType;

  /** The parameter's minimum value. */
  min: number;

  /** The parameter's maximum value. */
  max: number;

  /**
   * An optional step size to specify discrete increments by which the value
   * can vary.
   * Defaults to `0`, disabling stepping and allowing continuous values.
   */
  stepSize?: number;

  /**
   * If set to `true`, allows the user to manually specify values outside of
   * the defined [min, max]-range.
   */
  extendBeyondMinMax?: boolean;
}

/** A text parameter, typically displayed as a text field. */
export interface IStringParameter extends IParameter<string> {
  kind: "string";
}
