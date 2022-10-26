import {
  EnumSelector,
  IEnumParameter,
  IEnumParameterOption,
} from "@visian/ui-shared";

import { Parameter, ParameterConfig } from "./parameter";

export interface EnumParameterConfig<T> extends ParameterConfig<T> {
  selector?: EnumSelector;
  options: IEnumParameterOption<T>[];
}

export class EnumParameter<T>
  extends Parameter<T>
  implements IEnumParameter<T>
{
  public static readonly kind = "enum";
  public readonly kind = "enum";

  public selector?: EnumSelector;
  public options: IEnumParameterOption<T>[];

  constructor(config: EnumParameterConfig<T>) {
    super(config);
    this.selector = config.selector;
    this.options = config.options;
  }

  public toProps(): IEnumParameter<T> {
    return {
      ...(super.toProps() as Omit<IEnumParameter<T>, "options">),
      selector: this.selector,
      options: this.options,
    };
  }
}
