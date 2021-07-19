import { IDocument, ILayer, ILayerParameter } from "@visian/ui-shared";
import { computed, makeObservable } from "mobx";
import { Parameter, ParameterConfig } from "./parameter";

export interface LayerParameterConfig
  extends ParameterConfig<string | undefined> {
  filter?: (layer: ILayer) => boolean;
}

export class LayerParameter
  extends Parameter<string | undefined>
  implements ILayerParameter {
  public static readonly kind = "layer";
  public readonly kind = "layer";

  public readonly excludeFromSnapshotTracking = ["document"];

  constructor(config: LayerParameterConfig, protected document: IDocument) {
    super(config);
    if (config.filter) this.filter = config.filter;
    if (this.value === undefined) this.reset();

    makeObservable(this, { layerOptions: computed });
  }

  public filter: (layer: ILayer) => boolean = () => true;

  public get layerOptions() {
    return this.document.layers.filter(this.filter);
  }

  public reset(): void {
    super.reset();
    this.setValue(this.document?.layers.find(this.filter)?.id);
  }

  public toProps(): ILayerParameter {
    return {
      ...(super.toProps() as Omit<ILayerParameter, "filter">),
      filter: this.filter,
      layerOptions: this.layerOptions,
    };
  }
}
