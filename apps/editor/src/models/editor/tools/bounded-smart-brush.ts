import { RegionGrowingRenderer } from "@visian/rendering";
import { DragPoint, IDocument } from "@visian/ui-shared";
import { NumberParameter, Parameter } from "../parameters";
import { CircleBrush } from "./circle-brush";

export class BoundedSmartBrush<
  N extends "bounded-smart-brush" | "bounded-smart-eraser"
> extends CircleBrush<N> {
  constructor(
    document: IDocument,
    private regionGrowingRenderer: RegionGrowingRenderer,
    isPositive = true,
  ) {
    super(document, regionGrowingRenderer, isPositive, {
      name: (isPositive ? "bounded-smart-brush" : "bounded-smart-eraser") as N,
      altToolName: (isPositive
        ? "bounded-smart-eraser"
        : "bounded-smart-brush") as N,
      // TODO: Add icon.
      icon: isPositive ? "magicBrush" : "eraser",
      supportedViewModes: ["2D"],
      supportedLayerKinds: ["image"],
      isDrawingTool: true,
      isBrush: true,
      isBrushSizeFixed: true,
      params: [
        new NumberParameter({
          name: "threshold",
          labelTx: "threshold",
          scaleType: "linear",
          min: 0,
          max: 20,
          stepSize: 1,
          defaultValue: 5,
        }) as Parameter<unknown>,
        new NumberParameter({
          name: "boxRadius",
          labelTx: "box-radius",
          scaleType: "linear",
          min: 3,
          max: 20,
          stepSize: 1,
          defaultValue: 7,
          onBeforeValueChange: () =>
            document.sliceRenderer?.showBrushCursorPreview(),
        }) as Parameter<unknown>,
      ],
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
        this.params.threshold.value as number,
        this.params.boxRadius.value as number,
      );
    });
  }
}
