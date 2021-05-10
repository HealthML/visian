import { getPlaneAxes, IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { Editor } from "../../../models";
import { brushCursor as theme } from "../../../theme";

export const get2x2BrushCursorPoints = () => [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 2, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(2, 0, 0),
  new THREE.Vector3(0, 2, 0),
  new THREE.Vector3(2, 2, 0),
  new THREE.Vector3(2, 0, 0),
  new THREE.Vector3(2, 2, 0),
];

export class BrushCursor extends THREE.LineSegments implements IDisposable {
  private points: THREE.Vector3[] = [];
  private workingMatrix = new THREE.Matrix4();

  protected disposers: IDisposer[] = [];

  constructor(protected editor: Editor, protected viewType: ViewType) {
    super(new THREE.BufferGeometry(), new THREE.LineBasicMaterial(theme));

    this.disposers.push(
      autorun(this.updateRadius),
      autorun(this.updateScale),
      autorun(() => {
        this.updateVisibility();
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.geometry.dispose();
    (this.material as THREE.LineBasicMaterial).dispose();
  }

  public setUVTarget(u: number, v: number) {
    this.position.x = -u + 0.5;
    this.position.y = v - 0.5;
    this.editor.sliceRenderer?.lazyRender();
  }

  protected updateVisibility() {
    this.visible =
      this.editor.viewSettings.mainViewType === this.viewType &&
      this.editor.tools.canDraw;

    this.editor.sliceRenderer?.lazyRender();
  }

  private updateScale = () => {
    const { image } = this.editor;
    if (!image) return;

    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);

    this.scale.x = 1 / image.voxelCount[widthAxis];
    this.scale.y = 1 / image.voxelCount[heightAxis];

    this.editor.sliceRenderer?.lazyRender();
  };

  private updateRadius = () => {
    this.points = [];

    if (this.editor.tools.brushSizePixels === 0.5) {
      this.points = get2x2BrushCursorPoints();
    } else {
      let d = 1 - this.editor.tools.brushSizePixels;
      let x = 0;
      let y = this.editor.tools.brushSizePixels;

      const leftPoint = new THREE.Vector3(x, y + 0.5, 0);
      const rightPoint = new THREE.Vector3();

      while (x <= y) {
        if (d <= 0) {
          d += 2 * x + 3;
        } else {
          d += 2 * (x - y) + 5;
          rightPoint.set(x + 0.5, y + 0.5, 0);
          this.addLines(leftPoint, rightPoint);

          y--;

          leftPoint.set(x + 0.5, y + 0.5, 0);
          this.addLines(rightPoint, leftPoint);
        }
        x++;
      }
    }

    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

    this.editor.sliceRenderer?.lazyRender();
  };

  private addLines(start: THREE.Vector3, end: THREE.Vector3) {
    for (let i = 0; i < 8; i++) {
      const clones = [start.clone(), end.clone()];

      if (i % 2) {
        this.workingMatrix.makeScale(-1, 1, 1);
        clones.forEach((clone) => clone.applyMatrix4(this.workingMatrix));
        this.workingMatrix.makeRotationZ(((i - 1) * Math.PI) / 4);
        clones.forEach((clone) => clone.applyMatrix4(this.workingMatrix));
      } else {
        this.workingMatrix.makeRotationZ((i * Math.PI) / 4);
        clones.forEach((clone) => clone.applyMatrix4(this.workingMatrix));
      }

      this.points.push(...clones);
    }
  }
}

export default BrushCursor;
