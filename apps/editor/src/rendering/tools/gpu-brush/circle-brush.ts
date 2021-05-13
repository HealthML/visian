import { calculateLine, getOrthogonalAxis, getPlaneAxes } from "@visian/utils";
import { Editor } from "../../../models";
import { CircleRenderer } from "./circle-rendering";
import { DragPoint, DragTool } from "../types";
import { dragPointsEqual } from "../utils";
import { UndoableTool } from "./undoable-tool";

export class CircleBrush extends UndoableTool implements DragTool {
  private lastDragPoint?: DragPoint;

  constructor(
    editor: Editor,
    circleRenderer: CircleRenderer,
    private value = 255,
  ) {
    super(editor, circleRenderer);
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

  public endAt(dragPoint: DragPoint) {
    this.moveTo(dragPoint);

    this.endStroke(!this.value);
  }

  private drawCircleAround(dragPoint: DragPoint) {
    const [xAxis, yAxis] = getPlaneAxes(this.editor.viewSettings.mainViewType);
    const x = dragPoint[xAxis];
    const y = dragPoint[yAxis];

    if (this.editor.tools.brushSizePixels === 0.5) {
      const quadCircle = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];

      const pixelOffsetX = dragPoint.right ? -1 : 0;
      const pixelOffsetY = dragPoint.bottom ? -1 : 0;

      this.circleRenderer.renderCircles(
        ...quadCircle.map((pixel) => ({
          x: x + pixel.x + pixelOffsetX,
          y: y + pixel.y + pixelOffsetY,
          value: this.value,
          radius: 0,
        })),
      );

      return;
    }

    this.circleRenderer.renderCircles({
      x,
      y,
      value: this.value,
      radius: this.editor.tools.brushSizePixels,
    });
  }

  private drawStroke(start: DragPoint, end: DragPoint) {
    const orthogonalAxis = getOrthogonalAxis(
      this.editor.viewSettings.mainViewType,
    );
    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
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
