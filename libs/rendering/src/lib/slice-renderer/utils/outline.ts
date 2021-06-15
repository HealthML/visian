import { IEditor, IImageLayer, IOutline } from "@visian/ui-shared";
import { getPlaneAxes, IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { toolOverlays as theme } from "../theme";

export class Outline extends THREE.Line implements IDisposable, IOutline {
  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor, private viewType: ViewType) {
    super(new THREE.BufferGeometry(), new THREE.LineBasicMaterial(theme));

    this.position.x = 0.5;
    this.position.y = -0.5;

    this.disposers.push(autorun(this.updateScale));
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }

  public setPoints(points: THREE.Vector2[]) {
    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry().setFromPoints(points);
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

    this.scale.x = -1 / voxelCount[widthAxis];
    this.scale.y = 1 / voxelCount[heightAxis];

    this.editor.sliceRenderer?.lazyRender();
  };
}
