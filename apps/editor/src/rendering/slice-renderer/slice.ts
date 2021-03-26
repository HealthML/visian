import { IDisposer, TextureAtlas } from "@visian/util";
import { autorun } from "mobx";
import * as THREE from "three";

import { SliceMaterial } from "./slice-material";
import { IDisposable, ViewType } from "./types";
import { Corsshair, crosshairZ, getGeometrySize, imageMeshZ } from "./utils";

import type { Editor } from "../../models";

export class Slice extends THREE.Group implements IDisposable {
  private baseSize = new THREE.Vector2();

  private workingVector = new THREE.Vector2();

  private geometry = new THREE.PlaneGeometry();

  private imageMaterial: SliceMaterial;
  private imageMesh: THREE.Mesh;

  private crosshair: Corsshair;

  private disposers: IDisposer[] = [];

  constructor(
    private editor: Editor,
    private viewType: ViewType,
    private render: () => void,
  ) {
    super();

    this.imageMaterial = new SliceMaterial(editor, viewType, render);
    this.imageMesh = new THREE.Mesh(this.geometry, this.imageMaterial);
    this.imageMesh.position.z = imageMeshZ;
    this.imageMesh.userData = {
      viewType,
    };
    this.add(this.imageMesh);

    this.crosshair = new Corsshair(this.viewType, this.editor);
    this.crosshair.position.z = crosshairZ;
    this.add(this.crosshair);

    this.disposers.push(autorun(this.updateScale), autorun(this.updateOffset));
  }

  public dispose() {
    this.imageMaterial.dispose();
    this.crosshair.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  public setAtlas(atlas: TextureAtlas) {
    this.imageMaterial.setAtlas(atlas);

    this.baseSize.copy(getGeometrySize(atlas.voxelCount, this.viewType));
    this.updateScale();
  }

  private updateScale = () => {
    this.workingVector.copy(this.baseSize);

    if (this.viewType === this.editor.viewSettings.mainViewType) {
      this.workingVector.multiplyScalar(this.editor.viewSettings.zoomLevel);
    }

    this.scale.set(this.workingVector.x, this.workingVector.y, 1);

    this.render();
  };

  private updateOffset = () => {
    this.workingVector.multiplyScalar(0);

    if (this.viewType === this.editor.viewSettings.mainViewType) {
      this.workingVector.set(
        this.editor.viewSettings.offset.x,
        this.editor.viewSettings.offset.y,
      );
    }

    this.position.set(this.workingVector.x, this.workingVector.y, 0);

    this.render();
  };
}
