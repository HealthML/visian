import { ToolRenderer } from "@visian/rendering";
import { DragPoint, IDocument } from "@visian/ui-shared";
import { calculateLine, getOrthogonalAxis, getPlaneAxes } from "@visian/utils";

import { ToolConfig } from "./tool";
import { UndoableTool } from "./undoable-tool";
import { dragPointsEqual } from "./utils";

export class CircleBrush<
  N extends
    | "pixel-brush"
    | "pixel-eraser"
    | "smart-brush"
    | "smart-eraser"
    | "bounded-smart-brush"
    | "bounded-smart-eraser",
> extends UndoableTool<N> {
  public readonly excludeFromSnapshotTracking = ["toolRenderer", "document"];

  private lastDragPoint?: DragPoint;

  constructor(
    document: IDocument,
    toolRenderer: ToolRenderer,
    private isAdditive = true,
    toolConfig?: ToolConfig<N>,
  ) {
    super(
      toolConfig || {
        name: (isAdditive ? "pixel-brush" : "pixel-eraser") as N,
        infoTx: "info-brush",
        altToolName: (isAdditive ? "pixel-eraser" : "pixel-brush") as N,
        icon: isAdditive ? "pixelBrush" : "eraser",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
        supportAnnotationsOnly: true,
        isDrawingTool: true,
        isBrush: true,
        activationKeys: isAdditive ? "b" : "e",
      },
      document,
      toolRenderer,
    );
  }

  public startAt(dragPoint: DragPoint) {
    this.startStroke();

    this.drawCircleAround(dragPoint);

    this.lastDragPoint = dragPoint;
  }

  public moveTo(dragPoint: DragPoint) {
    if (
      !this.lastDragPoint ||
      (this.lastDragPoint && dragPointsEqual(this.lastDragPoint, dragPoint))
    )
      return;

    this.drawStroke(this.lastDragPoint, dragPoint);

    this.lastDragPoint = dragPoint;
  }

  public endAt(dragPoint: DragPoint | null) {
    if (dragPoint) this.moveTo(dragPoint);

    this.endStroke(!this.isAdditive);
  }

  protected get brushSize() {
    return this.document.tools.brushSize;
  }

  private drawCircleAround(dragPoint: DragPoint) {
    const [xAxis, yAxis] = getPlaneAxes(this.document.viewport2D.mainViewType);
    const x = dragPoint[xAxis];
    const y = dragPoint[yAxis];

    if (this.brushSize === 0.5) {
      const circleQuad = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];

      const pixelOffsetX = dragPoint.right ? -1 : 0;
      const pixelOffsetY = dragPoint.bottom ? -1 : 0;

      this.toolRenderer.renderCircles(
        this.isAdditive,
        ...circleQuad.map((pixel) => ({
          x: x + pixel.x + pixelOffsetX,
          y: y + pixel.y + pixelOffsetY,
          radius: 0,
        })),
      );

      return;
    }

    this.toolRenderer.renderCircles(this.isAdditive, {
      x,
      y,
      radius: this.brushSize,
    });
  }

  private drawStroke(start: DragPoint, end: DragPoint) {
    const orthogonalAxis = getOrthogonalAxis(
      this.document.viewport2D.mainViewType,
    );
    const [widthAxis, heightAxis] = getPlaneAxes(
      this.document.viewport2D.mainViewType,
    );
    const x1 = start[widthAxis];
    const y1 = start[heightAxis];
    const x2 = end[widthAxis];
    const y2 = end[heightAxis];

    const linePixels = calculateLine(x1, y1, x2, y2);

    linePixels.forEach(({ x, y }) => {
      const dragPoint = {
        x: 0,
        y: 0,
        z: 0,
        right: end.right,
        bottom: end.bottom,
      } as DragPoint;

      dragPoint[orthogonalAxis] = start[orthogonalAxis];
      dragPoint[widthAxis] = x;
      dragPoint[heightAxis] = y;

      this.drawCircleAround(dragPoint);
    });
  }
}
