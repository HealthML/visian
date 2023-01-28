import { RegionGrowingRenderer } from "@visian/rendering";
import { DragPoint, IDocument } from "@visian/ui-shared";

import { CircleBrush } from "./circle-brush";

export class BoundedSmartBrush<
  N extends "bounded-smart-brush" | "bounded-smart-eraser",
> extends CircleBrush<N> {
  public readonly excludeFromSnapshotTracking = [
    "document",
    "regionGrowingRenderer",
    "toolRenderer",
  ];

  constructor(
    document: IDocument,
    private regionGrowingRenderer: RegionGrowingRenderer,
    isAdditive = true,
  ) {
    super(document, regionGrowingRenderer, isAdditive, {
      name: (isAdditive ? "bounded-smart-brush" : "bounded-smart-eraser") as N,
      altToolName: (isAdditive
        ? "bounded-smart-eraser"
        : "bounded-smart-brush") as N,
      infoTx: "info-bounded-smart-brush",
      icon: isAdditive ? "boundedSmartBrush" : "boundedSmartEraser",
      supportedViewModes: ["2D"],
      supportedLayerKinds: ["image"],
      supportAnnotationsOnly: true,
      isDrawingTool: true,
      isBrush: true,
      isSmartBrush: true,
      activationKeys: isAdditive ? "r" : "ctrl+r",
    });
  }

  public startAt(dragPoint: DragPoint) {
    super.startAt(dragPoint);
    this.triggerRegionGrowing();
  }

  public moveTo(dragPoint: DragPoint) {
    super.moveTo(dragPoint);
    this.triggerRegionGrowing();
  }

  protected get brushSize() {
    return 0;
  }

  private triggerRegionGrowing() {
    this.regionGrowingRenderer.waitForRender().then(() => {
      this.regionGrowingRenderer.doRegionGrowing(
        this.document.tools.smartBrushThreshold,
        this.document.tools.boundedSmartBrushRadius,
        false,
      );
    });
  }
}
