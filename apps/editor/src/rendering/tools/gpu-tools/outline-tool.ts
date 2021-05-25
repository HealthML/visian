import { getPlaneAxes } from "@visian/utils";
import * as THREE from "three";
import { Editor } from "../../../models";
import { DragPoint, DragTool } from "../types";
import { dragPointsEqual } from "../utils";
import { ToolRenderer } from "./tool-rendering";
import { UndoableTool } from "./undoable-tool";

export class OutlineTool extends UndoableTool implements DragTool {
  private lastPoint?: DragPoint;

  private outline = new THREE.Shape();
  private geometry?: THREE.ShapeGeometry;
  private material: THREE.MeshBasicMaterial;

  constructor(editor: Editor, toolRenderer: ToolRenderer, private value = 255) {
    super(editor, toolRenderer);

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
    const [xAxis, yAxis] = getPlaneAxes(this.editor.viewSettings.mainViewType);
    return { x: dragPoint[xAxis], y: dragPoint[yAxis] };
  }

  private updateOutlinePreview() {
    const points = this.outline.getPoints();
    this.editor.sliceRenderer?.getOutline().setPoints(points);
    this.editor.sliceRenderer?.lazyRender();
  }

  private drawShape() {
    if (this.geometry) {
      this.geometry.dispose();
    }

    this.geometry = new THREE.ShapeGeometry(this.outline);

    this.toolRenderer.renderShape(this.geometry, this.material);
  }
}
