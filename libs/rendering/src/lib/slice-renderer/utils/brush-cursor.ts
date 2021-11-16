import { IEditor, IImageLayer } from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

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

export const getBoundedBrushCursorPoints = (radius: number) => {
  const actualRadius = radius + 0.5;
  return [
    new THREE.Vector3(-actualRadius, -actualRadius, 0),
    new THREE.Vector3(-actualRadius, actualRadius, 0),
    new THREE.Vector3(-actualRadius, -actualRadius, 0),
    new THREE.Vector3(actualRadius, -actualRadius, 0),
    new THREE.Vector3(-actualRadius, actualRadius, 0),
    new THREE.Vector3(actualRadius, actualRadius, 0),
    new THREE.Vector3(actualRadius, -actualRadius, 0),
    new THREE.Vector3(actualRadius, actualRadius, 0),
    new THREE.Vector3(-0.5, -0.5, 0),
    new THREE.Vector3(-0.5, 0.5, 0),
    new THREE.Vector3(-0.5, -0.5, 0),
    new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(-0.5, 0.5, 0),
    new THREE.Vector3(0.5, 0.5, 0),
    new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(0.5, 0.5, 0),
  ];
};

export class BrushCursor extends THREE.Group implements IDisposable {
  private points: THREE.Vector3[] = [];
  private workingMatrix = new THREE.Matrix4();

  private lineSegments: THREE.LineSegments;
  private centerDot: THREE.Points;

  protected disposers: IDisposer[] = [];

  constructor(
    protected editor: IEditor,
    protected viewType: ViewType,
    lineMaterial: THREE.LineBasicMaterial,
    pointsMaterial: THREE.PointsMaterial,
  ) {
    super();

    this.lineSegments = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      lineMaterial,
    );
    this.add(this.lineSegments);

    this.centerDot = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector2()]),
      pointsMaterial,
    );
    this.add(this.centerDot);

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
    this.lineSegments.geometry.dispose();
    (this.lineSegments.material as THREE.Material).dispose();
  }

  public setUVTarget(u: number, v: number) {
    this.position.x = -u + 0.5;
    this.position.y = v - 0.5;
    this.editor.sliceRenderer?.lazyRender();
  }

  protected updateVisibility() {
    this.visible =
      this.editor.activeDocument?.viewport2D.mainViewType === this.viewType &&
      this.editor.activeDocument?.tools.canDraw;

    this.editor.sliceRenderer?.lazyRender();
  }

  private updateScale = () => {
    if (
      !this.editor.activeDocument ||
      !this.editor.activeDocument.activeLayer
    ) {
      return;
    }

    const { voxelCount } = (this.editor.activeDocument
      .activeLayer as IImageLayer).image;

    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);

    this.scale.x = 1 / voxelCount[widthAxis];
    this.scale.y = 1 / voxelCount[heightAxis];

    this.editor.sliceRenderer?.lazyRender();
  };

  private updateRadius = () => {
    if (!this.editor.activeDocument) return;

    this.points = [];

    if (
      this.editor.activeDocument.tools.activeTool?.name ===
        "bounded-smart-brush" ||
      this.editor.activeDocument.tools.activeTool?.name ===
        "bounded-smart-eraser"
    ) {
      this.points = getBoundedBrushCursorPoints(
        this.editor.activeDocument.tools.boundedSmartBrushRadius,
      );

      this.centerDot.visible = false;
    } else if (
      this.editor.activeDocument.tools.brushSize === 0.5 &&
      this.editor.activeDocument.tools.activeTool?.name !== "smart-brush-3d"
    ) {
      this.points = get2x2BrushCursorPoints();

      this.centerDot.visible = false;
    } else {
      const radius =
        this.editor.activeDocument.tools.activeTool?.name === "smart-brush-3d"
          ? 0.5
          : this.editor.activeDocument.tools.brushSize + 0.5;

      let d = 1 - radius;
      let x = 0;
      let y = radius;

      const leftPoint = new THREE.Vector3(x, y, 0);
      const rightPoint = new THREE.Vector3();

      while (x <= y) {
        if (d <= 0) {
          d += 2 * x + 3;
        } else {
          d += 2 * (x - y) + 5;
          rightPoint.set(x + 0.5, y, 0);
          this.addLines(leftPoint, rightPoint);

          y--;

          leftPoint.set(x + 0.5, y, 0);
          this.addLines(rightPoint, leftPoint);
        }
        x++;
      }

      this.centerDot.visible = radius > 1;
    }

    this.lineSegments.geometry.dispose();
    this.lineSegments.geometry = new THREE.BufferGeometry().setFromPoints(
      this.points,
    );

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
