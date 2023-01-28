import { DragPoint, IDocument } from "@visian/ui-shared";

import { Tool } from "./tool";

export class CrosshairTool<N extends "crosshair-tool"> extends Tool<N> {
  constructor(document: IDocument) {
    super(
      {
        name: "crosshair-tool" as N,
        icon: "crosshair",
        labelTx: "crosshair-tool",
        supportedViewModes: ["2D"],
        activationKeys: "c",
      },
      document,
    );
  }

  public canActivate(): boolean {
    return super.canActivate() && this.document.has3DLayers;
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
