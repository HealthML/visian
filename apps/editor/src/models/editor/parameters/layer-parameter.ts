import { ILayer, ILayerParameter } from "@visian/ui-shared";
import { Parameter, ParameterConfig } from "./parameter";

export interface LayerParameterConfig extends ParameterConfig<string> {
  filter?: (layer: ILayer) => boolean;
}

export class LayerParameter
  extends Parameter<string>
  implements ILayerParameter {
  public static readonly kind = "layer";
  public readonly kind = "layer";

  public filter?: (layer: ILayer) => boolean;

  constructor(config: LayerParameterConfig) {
    super(config);
    this.filter = config.filter;
  }
}
