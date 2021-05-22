import { DragPoint, IDocument } from "@visian/ui-shared";
import { Tool } from "./tool";

export class CrosshairTool extends Tool {
  constructor(document: IDocument) {
    super(
      {
        name: "crosshair",
        labelTx: "crosshair-tool",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
      },
      document,
    );
  }

  public startAt(dragPoint: DragPoint): void {
    this.moveTo(dragPoint);
  }

  public moveTo(dragPoint: DragPoint): void {
    this.document.viewSettings.setSelectedVoxel(
      dragPoint.x,
      dragPoint.y,
      dragPoint.z,
    );
  }

  public endAt(dragPoint: DragPoint): void {
    this.moveTo(dragPoint);
  }
}
