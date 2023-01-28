import {
  Histogram,
  INumberRangeParameter,
  ScaleType,
  SerializationMethod,
} from "@visian/ui-shared";

import { NumberParameterConfig } from "./number-parameter";
import { Parameter, ParameterConfig } from "./parameter";

export interface NumberRangeParameterConfig
  extends Omit<NumberParameterConfig, "defaultValue" | "value">,
    ParameterConfig<[number, number]> {
  serializationMethod?: SerializationMethod;

  showRangeHandle?: boolean;
}

export class NumberRangeParameter
  extends Parameter<[number, number]>
  implements INumberRangeParameter
{
  public static readonly kind = "number-range";
  public readonly kind = "number-range";

  public scaleType?: ScaleType;
  public serializationMethod: SerializationMethod;
  public min: number;
  public max: number;
  public stepSize?: number;
  public extendBeyondMinMax?: boolean;
  public showRangeHandle?: boolean;

  public getHistogram?: () => Histogram | undefined;

  constructor(config: NumberRangeParameterConfig) {
    super(config);
    this.scaleType = config.scaleType;
    this.serializationMethod = config.serializationMethod || "push";
    this.min = config.min;
    this.max = config.max;
    this.stepSize = config.stepSize;
    this.extendBeyondMinMax = config.extendBeyondMinMax;
    this.showRangeHandle = config.showRangeHandle;

    this.getHistogram = config.getHistogram;
  }

  public toProps(): INumberRangeParameter {
    return {
      ...(super.toProps() as Omit<
        INumberRangeParameter,
        | "scaleType"
        | "serializationMethod"
        | "min"
        | "max"
        | "stepSize"
        | "extendBeyondMinMax"
        | "getHistogram"
      >),
      scaleType: this.scaleType,
      serializationMethod: this.serializationMethod,
      min: this.min,
      max: this.max,
      stepSize: this.stepSize,
      extendBeyondMinMax: this.extendBeyondMinMax,
      showRangeHandle: this.showRangeHandle,
      getHistogram: this.getHistogram,
    };
  }
}
