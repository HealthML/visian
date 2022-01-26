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

enum NodeIconMapping {
  NORMAL = 0,
  DOWN = 1,
  UP = 2,
  UPDOWN = 3,
}

export class Path extends THREE.Group implements IDisposable {
  private lines = new THREE.LineSegments();
  private points = new THREE.Points();

  private disposers: IDisposer[] = [];

  constructor(
    private editor: IEditor,
    private viewType: ViewType,
    lineMaterial: THREE.Material,
    nodeMaterial: THREE.Material,
  ) {
    super();

    this.lines.material = lineMaterial;
    this.points.material = nodeMaterial;

    this.position.set(0.5, -0.5, -1);
    this.scale.set(-1, 1, 1);

    this.add(this.lines);
    this.add(this.points);

    this.disposers.push(autorun(this.updateGeometries));
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.lines.geometry.dispose();
    this.points.geometry.dispose();
  }

  private updateGeometries = () => {
    if (!this.editor.activeDocument?.baseImageLayer) return;

    const path = (this.editor.activeDocument.tools.tools["measurement-tool"] as
      | IMeasurementTool
      | undefined)?.path;

    if (!path || path.length < 1) {
      this.visible = false;
      this.editor.sliceRenderer?.lazyRender();
      return;
    }
    this.visible = true;

    const sliceAxis = getOrthogonalAxis(this.viewType);

    const slice = this.editor.activeDocument.viewSettings.selectedVoxel[
      sliceAxis
    ];

    const [widthAxis, heightAxis] = getPlaneAxes(this.viewType);

    const linePoints: THREE.Vector2[] = [];
    const nodePoints: THREE.Vector2[] = [];
    const nodeIcons: number[] = [];

    path.forEach((point, index) => {
      const nextPoint = path[Math.min(path.length - 1, index + 1)];
      const previousPoint = path[Math.max(0, index - 1)];

      const isDown =
        Math.max(nextPoint[sliceAxis], previousPoint[sliceAxis]) >
        point[sliceAxis];
      const isUp =
        Math.min(nextPoint[sliceAxis], previousPoint[sliceAxis]) <
        point[sliceAxis];

      const nodeIcon = isDown
        ? isUp
          ? NodeIconMapping.UPDOWN
          : NodeIconMapping.DOWN
        : isUp
        ? NodeIconMapping.UP
        : NodeIconMapping.NORMAL;

      if (point[sliceAxis] === slice) {
        if (nextPoint[sliceAxis] === slice) {
          linePoints.push(
            new THREE.Vector2(point[widthAxis], point[heightAxis]),
            new THREE.Vector2(nextPoint[widthAxis], nextPoint[heightAxis]),
          );
          nodePoints.push(
            new THREE.Vector2(point[widthAxis], point[heightAxis]),
          );
          nodeIcons.push(nodeIcon);
        } else {
          linePoints.push(
            new THREE.Vector2(point[widthAxis], point[heightAxis]),
            this.getInterpolatedPoint(point, nextPoint, sliceAxis, [
              widthAxis,
              heightAxis,
            ]),
          );
          nodePoints.push(
            new THREE.Vector2(point[widthAxis], point[heightAxis]),
          );
          nodeIcons.push(nodeIcon);
        }
      } else if (nextPoint[sliceAxis] === slice) {
        linePoints.push(
          this.getInterpolatedPoint(nextPoint, point, sliceAxis, [
            widthAxis,
            heightAxis,
          ]),
          new THREE.Vector2(nextPoint[widthAxis], nextPoint[heightAxis]),
        );
        nodePoints.push(
          new THREE.Vector2(nextPoint[widthAxis], nextPoint[heightAxis]),
        );
        nodeIcons.push(nodeIcon);
      } else if (
        (point[sliceAxis] < slice && nextPoint[sliceAxis] > slice) ||
        (point[sliceAxis] > slice && nextPoint[sliceAxis] < slice)
      ) {
        const sliceOffset = Math.abs(slice - point[sliceAxis]) - 1;
        linePoints.push(
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
    linePoints.forEach((point) => point.addScalar(0.5).divide(scale));
    nodePoints.forEach((point) => point.addScalar(0.5).divide(scale));

    this.lines.geometry.dispose();
    this.lines.geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

    this.points.geometry.dispose();
    this.points.geometry = new THREE.BufferGeometry().setFromPoints(nodePoints);
    this.points.geometry.setAttribute(
      "textureIndex",
      new THREE.Float32BufferAttribute(new Float32Array(nodeIcons), 1),
    );

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
