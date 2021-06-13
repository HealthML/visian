import type React from "react";
import type { SerializationMethod, TooltipPosition } from "../../components";
import { ILayer } from "./layers";
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

  /** The default value this parameter is reset to. */
  defaultValue: T;
  /** The parameter's current value. */
  value: T;
  /** Sets the parameter's current value. */
  setValue(value: T): void;
  reset(): void;

  /**
   * An optional event listener that is called before the parameter value is
   * updated.
   */
  onBeforeValueChange?: () => void;

  /**
   * Returns an object that can be passed to a React component using the object
   * spread syntax.
   *
   * This is necessary as inherited class properties are not necessarily
   * included when spreading an object.
   */
  toProps(): IParameter<T>;
}

/** A boolean parameter, typically displayed as a checkbox or switch. */
export interface IBooleanParameter extends IParameter<boolean> {
  kind: "bool";
}

/** A button parameter, used to invoke some action. */
export interface IButtonParameter<T = void> extends IParameter<T> {
  kind: "button";

  /** A user-defined callback that is invoked when the button is pressed. */
  onPress?: (
    name: string,
    value: T,
    event?: PointerEvent | React.PointerEvent,
  ) => void;

  /** A callback that should be invoked when the button is pressed. */
  handlePress(event?: PointerEvent | React.PointerEvent): void;
}

/** An option that can be chosen for an enum parameter. */
export interface IEnumParameterOption<T> {
  label?: string;
  labelTx?: string;

  tooltip?: string;
  tooltipTx?: string;
  tooltipPosition?: TooltipPosition;

  value: T;
}

export type EnumSelector = "switch" | "drop-down";

/** A class selection parameter, typically displayed as a select field or switch. */
export interface IEnumParameter<T> extends IParameter<T> {
  kind: "enum";

  /**
   * The UI components used pick an option.
   * If none is set, the component is determined automatically based on the
   * number of options.
   */
  selector?: EnumSelector;

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

  /** An optional method that computes frequency data to display along the slider. */
  getHistogram?: () => number[] | undefined;
}

/** A numeric range parameter, typically displayed as a slider with two thumbs. */
export interface INumberRangeParameter
  extends Omit<
      INumberParameter,
      "kind" | "value" | "defaultValue" | "setValue" | "toProps"
    >,
    IParameter<[number, number]> {
  kind: "number-range";

  /**
   * Configures if and how the range-limiting values are enfored to keep their
   * order.
   *
   * Defaults to `"push"`.
   */
  serializationMethod: SerializationMethod;
}

/** A text parameter, typically displayed as a text field. */
export interface IStringParameter extends IParameter<string> {
  kind: "string";
}

/**
 * A color parameter, typically displayed as a color picker.
 * The color is stored as a CSS color string.
 */
export interface IColorParameter extends IParameter<string> {
  kind: "color";
}

/**
 * A layer parameter, typically displayed as a layer selection drop-down.
 * The layer is stored by its id.
 */
export interface ILayerParameter extends IParameter<string | undefined> {
  kind: "layer";

  /**
   * A filter specifiying what kind of layers can be selected.
   * Could, i.e., be used to only allow annotations to be selected.
   * Defaults to allowing all layers.
   */
  filter: (layer: ILayer) => boolean;

  /**
   * The qualifying layer to choose from.
   * These are computed based on the filter.
   */
  layerOptions: ILayer[];
}

/** A file parameter, typically displayed as a file picker. */
export interface IFileParameter extends IParameter<File | undefined> {
  kind: "file";
}
