import { IParameter, TooltipPosition } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

export interface ParameterSnapshot<T = unknown> {
  value: T;

  // As all other properties are typically not edited by the user and thus
  // expected to be handled by the application, we do not persist them
}

export interface ParameterConfig<T = unknown> extends ParameterSnapshot<T> {
  name: string;

  label?: string;
  labelTx?: string;

  tooltip?: string;
  tooltipTx?: string;
  tooltipPosition?: TooltipPosition;
}

export class Parameter<T = unknown>
  implements IParameter<T>, ISerializable<ParameterSnapshot<T>> {
  public static readonly kind: string = "none";
  public readonly kind: string = "none";

  public readonly name!: string;

  public readonly label?: string;
  public readonly labelTx?: string;

  public readonly tooltip?: string;
  public readonly tooltipTx?: string;
  public readonly tooltipPosition?: TooltipPosition;

  public value!: T;

  constructor(config: ParameterConfig<T>) {
    this.name = config.name;
    this.label = config.label;
    this.labelTx = config.labelTx;
    this.tooltip = config.tooltip;
    this.tooltipTx = config.tooltipTx;
    this.tooltipPosition = config.tooltipPosition;
    this.value = config.value;

    makeObservable({
      value: observable,
      setValue: action,
      applySnapshot: action,
    });
  }

  public setValue = (value: T): void => {
    this.value = value;
  };

  // Serialization
  public toJSON(): ParameterSnapshot<T> {
    return {
      value: this.value,
    };
  }

  // Here we make an exception to the snapshot being a `Partial` as we do not
  // expect to encounter stored parameters without an associated value
  public applySnapshot(snapshot: ParameterSnapshot<T>): Promise<void> {
    this.value = snapshot.value;
    return Promise.resolve();
  }
}
