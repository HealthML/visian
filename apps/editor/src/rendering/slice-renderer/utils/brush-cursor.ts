import { getPlaneAxes, IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { Editor } from "../../../models";
import { brushCursor as theme } from "../../../theme";

export const get2x2BrushCursorLines = (
  lineMaterial: THREE.LineBasicMaterial,
) => {
  const pointPairs = [
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0)],
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0)],
    [new THREE.Vector3(0, 2, 0), new THREE.Vector3(2, 2, 0)],
    [new THREE.Vector3(2, 0, 0), new THREE.Vector3(2, 2, 0)],
  ];

  const lines: THREE.Line[] = [];

  pointPairs.forEach((pointPair) => {
    lines.push(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pointPair),
        lineMaterial,
      ),
    );
  });

  return lines;
};

export class BrushCursor extends THREE.Group implements IDisposable {
  private lines: THREE.Line[] = [];

  private material = new THREE.LineBasicMaterial(theme);

  protected disposers: IDisposer[] = [];

  constructor(protected editor: Editor, protected viewType: ViewType) {
    super();

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
    this.lines.forEach((line) => line.geometry.dispose());
    this.material.dispose();
  }

  public setUVTarget(u: number, v: number) {
    this.position.x = -u + 0.5;
    this.position.y = v - 0.5;
    this.editor.sliceRenderer?.lazyRender();
  }

  protected updateVisibility() {
    this.visible =
      this.editor.viewSettings.mainViewType === this.viewType &&
      this.editor.tools.isBrushToolSelected &&
      this.editor.tools.isCursorOverDrawableArea &&
      this.editor.isAnnotationVisible;

    this.editor.sliceRenderer?.lazyRender();
  }

  private updateScale = () => {
    const image = this.editor.image;
    if (!image) return;

    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);

    this.scale.x = 1 / image.voxelCount[widthAxis];
    this.scale.y = 1 / image.voxelCount[heightAxis];

    this.editor.sliceRenderer?.lazyRender();
  };

  private updateRadius = () => {
    this.remove(...this.lines);
    this.lines = [];

    if (this.editor.tools.brushSizePixels === 0.5) {
      this.lines.push(...get2x2BrushCursorLines(this.material));
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

    this.add(...this.lines);

    this.editor.sliceRenderer?.lazyRender();
  };

  private addLines(start: THREE.Vector3, end: THREE.Vector3) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

    this.lines.push(new THREE.Line(geometry, this.material));
    for (let i = 1; i < 8; i++) {
      const geometryClone = geometry.clone();

      if (i % 2) {
        geometryClone.scale(-1, 1, 1);
        geometryClone.rotateZ(((i - 1) * Math.PI) / 4);
      } else {
        geometryClone.rotateZ((i * Math.PI) / 4);
      }

      this.lines.push(new THREE.Line(geometryClone, this.material));
    }
  }
}

export default BrushCursor;
