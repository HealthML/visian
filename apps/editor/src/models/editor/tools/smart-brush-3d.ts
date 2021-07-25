import { RegionGrowingRenderer3D } from "@visian/rendering";
import { DragPoint, IDocument } from "@visian/ui-shared";
import { ButtonParameter } from "../parameters";
import { Tool } from "./tool";

export class SmartBrush3D<N extends "smart-brush-3d"> extends Tool<N> {
  constructor(
    document: IDocument,
    private regionGrowingRenderer: RegionGrowingRenderer3D,
  ) {
    super(
      {
        name: "smart-brush-3d" as N,
        icon: "magicBrush",
        supportedViewModes: ["2D", "3D"],
        supportedLayerKinds: ["image"],
        isDrawingTool: true,
        isBrush: true,
        isSmartBrush: true,
        params: [
          new ButtonParameter({
            name: "submit",
            labelTx: "submit-3D-region-growing",
            onClick: () => {
              this.regionGrowingRenderer.flushToAnnotation();
            },
            defaultValue: undefined as unknown,
          }),
        ],
      },
      document,
    );
  }

  public startAt(dragPoint: DragPoint): void {
    this.regionGrowingRenderer.setSeed(dragPoint);
  }

  public endAt(_dragPoint: DragPoint): void {
    this.regionGrowingRenderer.doRegionGrowing(
      this.document.tools.smartBrushThreshold,
    );
  }
}
