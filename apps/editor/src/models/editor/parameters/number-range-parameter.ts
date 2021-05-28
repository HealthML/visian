import { INumberRangeParameter } from "@visian/ui-shared";
import { Parameter, ParameterConfig } from "./parameter";

export interface NumberRangeParameterConfig
  extends ParameterConfig<[number, number]> {
  min: number;
  max: number;
}

// TODO: Histogram.
export class NumberRangeParameter
  extends Parameter<[number, number]>
  implements INumberRangeParameter {
  public static readonly kind = "number-range";
  public readonly kind = "number-range";

  public min: number;
  public max: number;

  constructor(config: NumberRangeParameterConfig) {
    super(config);
    this.min = config.min;
    this.max = config.max;
  }
}
