import { IParameter, TooltipPosition } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, makeObservable, observable, toJS } from "mobx";

export interface ParameterSnapshot<T = unknown> {
  name: string;
  value: T;

  // As all other properties are typically not edited by the user and thus
  // expected to be handled by the application, we do not persist them
}

export interface ParameterConfig<T = unknown> {
  name: string;

  label?: string;
  labelTx?: string;

  tooltip?: string;
  tooltipTx?: string;
  tooltipPosition?: TooltipPosition;

  onBeforeValueChange?: () => void;

  defaultValue: T;
}

export class Parameter<T = unknown>
  implements IParameter<T>, ISerializable<ParameterSnapshot<T>>
{
  public static readonly kind: string = "none";
  public readonly kind: string = "none";

  public readonly name!: string;

  public readonly label?: string;
  public readonly labelTx?: string;

  public readonly tooltip?: string;
  public readonly tooltipTx?: string;
  public readonly tooltipPosition?: TooltipPosition;

  public value!: T;
  public defaultValue!: T;

  public onBeforeValueChange?: () => void;

  constructor(config: ParameterConfig<T>) {
    this.name = config.name;
    this.label = config.label;
    this.labelTx = config.labelTx;
    this.tooltip = config.tooltip;
    this.tooltipTx = config.tooltipTx;
    this.tooltipPosition = config.tooltipPosition;
    this.value = config.defaultValue;
    this.defaultValue = config.defaultValue;
    this.onBeforeValueChange = config.onBeforeValueChange;

    makeObservable(this, {
      value: observable,
      setValue: action,
      reset: action,
      applySnapshot: action,
    });
  }

  public setValue = (value: T): void => {
    if (value !== this.value && this.onBeforeValueChange) {
      this.onBeforeValueChange();
    }

    this.value = value;
  };

  public reset(): void {
    if (this.value !== this.defaultValue && this.onBeforeValueChange) {
      this.onBeforeValueChange();
    }

    this.value = this.defaultValue;
  }

  public toProps(): IParameter<T> {
    return {
      kind: this.kind,
      name: this.name,
      label: this.label,
      labelTx: this.labelTx,
      tooltip: this.tooltip,
      tooltipTx: this.tooltipTx,
      tooltipPosition: this.tooltipPosition,
      value: this.value,
      defaultValue: this.defaultValue,
      setValue: this.setValue,
      reset: this.reset,
      toProps: this.toProps,
    };
  }

  // Serialization
  public toJSON(): ParameterSnapshot<T> {
    return {
      name: this.name,
      value: toJS(this.value),
    };
  }

  // Here we make an exception to the snapshot being a `Partial` as we do not
  // expect to encounter stored parameters without an associated value
  public applySnapshot(snapshot: ParameterSnapshot<T>): Promise<void> {
    if (snapshot.name && snapshot.name !== this.name) {
      throw new Error("Parameter names do not match");
    }

    this.value = snapshot.value;
    return Promise.resolve();
  }
}
