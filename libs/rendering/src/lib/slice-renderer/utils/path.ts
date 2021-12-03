import { IEditor, IMeasurementTool } from "@visian/ui-shared";
import {
  getOrthogonalAxis,
  getPlaneAxes,
  IDisposable,
  IDisposer,
  Vector,
  ViewType,
} from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class Path extends THREE.Group implements IDisposable {
  private lines = new THREE.LineSegments();

  private disposers: IDisposer[] = [];

  constructor(
    private editor: IEditor,
    private viewType: ViewType,
    lineMaterial: THREE.Material,
  ) {
    super();

    this.lines.material = lineMaterial;

    this.position.set(0.5, -0.5, 0);
    this.scale.set(-1, 1, 1);

    this.add(this.lines);

    this.disposers.push(autorun(this.updateLines));
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.lines.geometry.dispose();
  }

  private updateLines = () => {
    if (!this.editor.activeDocument?.baseImageLayer) return;

    const path = (this.editor.activeDocument.tools.tools["measurement-tool"] as
      | IMeasurementTool
      | undefined)?.path;

    if (!path || path.length < 2) {
      this.lines.visible = false;
      this.editor.sliceRenderer?.lazyRender();
      return;
    }
    this.lines.visible = true;

    const sliceAxis = getOrthogonalAxis(this.viewType);

    const slice = this.editor.activeDocument.viewSettings.selectedVoxel[
      sliceAxis
    ];

    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);

    const points: THREE.Vector2[] = [];

    path.forEach((point, index) => {
      if (index === path.length - 1) return;

      const nextPoint = path[index + 1];

      if (point[sliceAxis] === slice) {
        if (nextPoint[sliceAxis] === slice) {
          points.push(
            new THREE.Vector2(point[widthAxis], point[heightAxis]),
            new THREE.Vector2(nextPoint[widthAxis], nextPoint[heightAxis]),
          );
        } else {
          points.push(
            new THREE.Vector2(point[widthAxis], point[heightAxis]),
            this.getInterpolatedPoint(point, nextPoint, sliceAxis, [
              widthAxis,
              heightAxis,
            ]),
          );
        }
      } else if (nextPoint[sliceAxis] === slice) {
        points.push(
          this.getInterpolatedPoint(nextPoint, point, sliceAxis, [
            widthAxis,
            heightAxis,
          ]),
          new THREE.Vector2(nextPoint[widthAxis], nextPoint[heightAxis]),
        );
      } else if (
        (point[sliceAxis] < slice && nextPoint[sliceAxis] > slice) ||
        (point[sliceAxis] > slice && nextPoint[sliceAxis] < slice)
      ) {
        const sliceOffset = Math.abs(slice - point[sliceAxis]) - 1;
        points.push(
          this.getInterpolatedPoint(
            point,
            nextPoint,
            sliceAxis,
            [widthAxis, heightAxis],
            sliceOffset,
          ),
          this.getInterpolatedPoint(
            point,
            nextPoint,
            sliceAxis,
            [widthAxis, heightAxis],
            sliceOffset + 1,
          ),
        );
      }
    });

    const { voxelCount } = this.editor.activeDocument.baseImageLayer.image;
    const scale = new THREE.Vector2(
      voxelCount[widthAxis],
      voxelCount[heightAxis],
    );
    points.forEach((point) => point.addScalar(0.5).divide(scale));

    this.lines.geometry.dispose();
    this.lines.geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.editor.sliceRenderer?.lazyRender();
  };

  private getInterpolatedPoint(
    from: Vector,
    to: Vector,
    axis: "x" | "y" | "z",
    [widthAxis, heightAxis]: ("x" | "y" | "z")[],
    distance = 0,
  ) {
    return new THREE.Vector2(from[widthAxis], from[heightAxis]).lerp(
      new THREE.Vector2(to[widthAxis], to[heightAxis]),
      (distance + 0.5) / Math.abs(from[axis] - to[axis]),
    );
  }
}
