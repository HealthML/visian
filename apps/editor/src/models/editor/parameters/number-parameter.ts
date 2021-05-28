import { INumberParameter, ScaleType } from "@visian/ui-shared";

import { Parameter, ParameterConfig } from "./parameter";

export interface NumberParameterConfig extends ParameterConfig<number> {
  scaleType?: ScaleType;
  min: number;
  max: number;
  stepSize?: number;
  extendBeyondMinMax?: boolean;
}

// TODO: Histogram.
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

  constructor(config: NumberParameterConfig) {
    super(config);
    this.scaleType = config.scaleType;
    this.min = config.min;
    this.max = config.max;
    this.stepSize = config.stepSize;
    this.extendBeyondMinMax = config.extendBeyondMinMax;
  }
}
