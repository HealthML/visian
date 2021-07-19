import { INumberParameter, ScaleType } from "@visian/ui-shared";

import { Parameter, ParameterConfig } from "./parameter";

export interface NumberParameterConfig extends ParameterConfig<number> {
  scaleType?: ScaleType;
  min: number;
  max: number;
  stepSize?: number;
  extendBeyondMinMax?: boolean;

  getHistogram?: () => number[] | undefined;
}

export class NumberParameter
  extends Parameter<number>
  implements INumberParameter {
  public static readonly kind = "number";
  public readonly kind = "number";

  public scaleType?: ScaleType;
  public min: number;
  public max: number;
  public stepSize?: number;
  public extendBeyondMinMax?: boolean;

  public getHistogram?: () => number[] | undefined;

  constructor(config: NumberParameterConfig) {
    super(config);
    this.scaleType = config.scaleType;
    this.min = config.min;
    this.max = config.max;
    this.stepSize = config.stepSize;
    this.extendBeyondMinMax = config.extendBeyondMinMax;

    this.getHistogram = config.getHistogram;
  }

  public toProps(): INumberParameter {
    return {
      ...(super.toProps() as Omit<
        INumberParameter,
        | "scaleType"
        | "min"
        | "max"
        | "stepSize"
        | "extendBeyondMinMax"
        | "getHistogram"
      >),
      scaleType: this.scaleType,
      min: this.min,
      max: this.max,
      stepSize: this.stepSize,
      extendBeyondMinMax: this.extendBeyondMinMax,
      getHistogram: this.getHistogram,
    };
  }
}
