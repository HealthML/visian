import { IEnumParameter, IEnumParameterOption } from "@visian/ui-shared";

import { Parameter, ParameterConfig } from "./parameter";

export interface EnumParameterConfig<T> extends ParameterConfig<T> {
  options: IEnumParameterOption<T>[];
}

export class EnumParameter<T>
  extends Parameter<T>
  implements IEnumParameter<T> {
  public static readonly kind = "enum";
  public readonly kind = "enum";

  public options: IEnumParameterOption<T>[];

  constructor(config: EnumParameterConfig<T>) {
    super(config);
    this.options = config.options;
  }

  public toProps(): IEnumParameter<T> {
    return {
      ...(super.toProps() as Omit<IEnumParameter<T>, "options">),
      options: this.options,
    };
  }
}
