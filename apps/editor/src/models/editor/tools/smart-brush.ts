import { RegionGrowingRenderer } from "@visian/rendering";
import { IDocument, IImageLayer } from "@visian/ui-shared";
import { NumberParameter, Parameter } from "../parameters";
import { CircleBrush } from "./circle-brush";

export class SmartBrush<
  N extends "smart-brush" | "smart-eraser"
> extends CircleBrush<N> {
  constructor(
    document: IDocument,
    private regionGrowingRenderer: RegionGrowingRenderer,
    value = 255,
  ) {
    super(document, regionGrowingRenderer, value, {
      name: (value ? "smart-brush" : "smart-eraser") as N,
      altToolName: (value ? "smart-eraser" : "smart-brush") as N,
      icon: value ? "magicBrush" : "eraser",
      supportedViewModes: ["2D"],
      supportedLayerKinds: ["image"],
      isDrawingTool: true,
      isBrush: true,
      params: [
        new NumberParameter({
          name: "threshold",
          labelTx: "threshold",
          scaleType: "linear",
          min: 0,
          max: 20,
          stepSize: 1,
          defaultValue: 10,
        }) as Parameter<unknown>,
      ],
    });
  }

  protected endStroke(
    isDeleteOperation: boolean | undefined,
    imageLayer = this.document.activeLayer as IImageLayer | undefined,
    viewType = this.document.viewport2D.mainViewType,
  ) {
    this.regionGrowingRenderer.doRegionGrowing(
      this.params.threshold.value as number,
    );

    super.endStroke(isDeleteOperation, imageLayer, viewType);
  }
}
