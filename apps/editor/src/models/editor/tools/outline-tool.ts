import { ToolRenderer } from "@visian/rendering";
import { DragPoint, IDocument } from "@visian/ui-shared";
import { getPlaneAxes } from "@visian/utils";
import * as THREE from "three";
import { UndoableTool } from "./undoable-tool";
import { dragPointsEqual } from "./utils";

export class OutlineTool<
  N extends "outline-tool" | "outline-eraser"
> extends UndoableTool<N> {
  private lastPoint?: DragPoint;

  private outline = new THREE.Shape();
  private geometry?: THREE.ShapeGeometry;
  private material: THREE.MeshBasicMaterial;

  constructor(
    document: IDocument,
    toolRenderer: ToolRenderer,
    private value = 255,
  ) {
    super(
      {
        name: (value ? "outline-tool" : "outline-eraser") as N,
        altToolName: (value ? "outline-eraser" : "outline-tool") as N,
        icon: value ? "outline" : "outline",
        supportedViewModes: ["2D"],
        supportedLayerKinds: ["image"],
        isDrawingTool: true,
      },
      document,
      toolRenderer,
    );

    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.value, this.value, this.value),
    });
  }

  public startAt(dragPoint: DragPoint) {
    this.startStroke();

    // Ensure the shape is reset in case we missed an end event.
    this.outline = new THREE.Shape();

    const coords = this.getCoords(dragPoint);
    this.outline.moveTo(coords.x, coords.y);

    this.lastPoint = dragPoint;
  }

  public moveTo(dragPoint: DragPoint) {
    if (!this.lastPoint || dragPointsEqual(this.lastPoint, dragPoint)) return;

    const coords = this.getCoords(dragPoint);
    this.outline.lineTo(coords.x, coords.y);

    this.updateOutlinePreview();

    this.lastPoint = dragPoint;
  }

  public endAt(dragPoint: DragPoint | null) {
    if (dragPoint) this.moveTo(dragPoint);

    this.drawShape();

    // Reset the outline for the next stroke.
    this.outline = new THREE.Shape();
    this.updateOutlinePreview();

    this.lastPoint = undefined;

    this.endStroke(!this.value);
  }

  private getCoords(dragPoint: DragPoint) {
    const [xAxis, yAxis] = getPlaneAxes(this.document.viewport2D.mainViewType);
    return { x: dragPoint[xAxis], y: dragPoint[yAxis] };
  }

  private updateOutlinePreview() {
    const points = this.outline.getPoints();
    this.document.sliceRenderer?.getOutline().setPoints(points);
    this.document.sliceRenderer?.lazyRender();
  }

  private drawShape() {
    if (this.geometry) {
      this.geometry.dispose();
    }

    this.geometry = new THREE.ShapeGeometry(this.outline);

    this.toolRenderer.renderShape(this.geometry, this.material);
  }
}
