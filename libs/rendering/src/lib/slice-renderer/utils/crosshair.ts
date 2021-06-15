import { IEditor, IImageLayer } from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, ViewType } from "@visian/utils";
import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";

import { crosshair as lineMaterialProps } from "../theme";

export class Crosshair extends THREE.Group implements IDisposable {
  private size = new THREE.Vector2();

  private horizontalLine: THREE.Line;
  private verticalLine: THREE.Line;

  private lineMaterial = new THREE.LineBasicMaterial(lineMaterialProps);

  private widthAxis: "x" | "y" | "z";
  private heightAxis: "x" | "y" | "z";

  private disposers: IReactionDisposer[] = [];

  constructor(viewType: ViewType, private editor: IEditor) {
    super();

    [this.widthAxis, this.heightAxis] = getPlaneAxes(viewType);

    this.horizontalLine = this.createLine([
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(0.5, 0, 0),
    ]);

    this.verticalLine = this.createLine([
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(0, 0.5, 0),
    ]);

    this.add(this.horizontalLine, this.verticalLine);

    this.disposers.push(
      autorun(this.updateTarget),
      autorun(this.updateVisibility),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.verticalLine.geometry.dispose();
    this.horizontalLine.geometry.dispose();
    this.lineMaterial.dispose();
  }

  public setSize(size: THREE.Vector2) {
    this.size.copy(size);
    this.scale.set(size.x, size.y, 1);
    this.updateTarget();
  }

  private createLine(points: THREE.Vector3[]): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, this.lineMaterial);
  }

  private updateTarget = () => {
    if (
      !this.editor.activeDocument ||
      !this.editor.activeDocument.activeLayer
    ) {
      return;
    }

    const { voxelCount } = (this.editor.activeDocument
      .activeLayer as IImageLayer).image;

    const x =
      1 -
      (this.editor.activeDocument.viewSettings.selectedVoxel[this.widthAxis] +
        0.5) /
        voxelCount[this.widthAxis];
    const y =
      (this.editor.activeDocument.viewSettings.selectedVoxel[this.heightAxis] +
        0.5) /
      voxelCount[this.heightAxis];

    this.verticalLine.visible = x >= 0 && x <= 1;
    this.verticalLine.position.x = x - 0.5;

    this.horizontalLine.visible = y >= 0 && y <= 1;
    this.horizontalLine.position.y = y - 0.5;
  };

  private updateVisibility = () => {
    if (
      !this.editor.activeDocument ||
      !this.editor.activeDocument.activeLayer
    ) {
      return;
    }

    this.visible =
      (this.editor.activeDocument.activeLayer as IImageLayer).is3DLayer &&
      this.editor.activeDocument.viewport2D.showSideViews;
  };
}

export default Crosshair;
