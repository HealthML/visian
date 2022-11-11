import { RegionGrowingRenderer } from "@visian/rendering";
import { IDocument, IImageLayer } from "@visian/ui-shared";

import { CircleBrush } from "./circle-brush";

export class SmartBrush<
  N extends "smart-brush" | "smart-eraser",
> extends CircleBrush<N> {
  public readonly excludeFromSnapshotTracking = [
    "regionGrowingRenderer",
    "document",
    "toolRenderer",
  ];

  constructor(
    document: IDocument,
    private regionGrowingRenderer: RegionGrowingRenderer,
    isAdditive = true,
  ) {
    super(document, regionGrowingRenderer, isAdditive, {
      name: (isAdditive ? "smart-brush" : "smart-eraser") as N,
      altToolName: (isAdditive ? "smart-eraser" : "smart-brush") as N,
      infoTx: "info-smart-brush",
      icon: isAdditive ? "magicBrush" : "smartEraser",
      supportedViewModes: ["2D"],
      supportedLayerKinds: ["image"],
      supportAnnotationsOnly: true,
      isDrawingTool: true,
      isBrush: true,
      isSmartBrush: true,
      activationKeys: isAdditive ? "s" : "alt+e",
    });
  }

  protected endStroke(
    isDeleteOperation: boolean | undefined,
    imageLayer = this.document.activeLayer as IImageLayer | undefined,
    viewType = this.document.viewport2D.mainViewType,
  ) {
    this.regionGrowingRenderer.doRegionGrowing(
      this.document.tools.smartBrushThreshold,
    );

    super.endStroke(isDeleteOperation, imageLayer, viewType);
  }
}
