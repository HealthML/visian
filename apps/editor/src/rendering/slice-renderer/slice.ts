import { IDisposer, TextureAtlas } from "@visian/util";
import { autorun } from "mobx";
import * as THREE from "three";

import { SliceMaterial } from "./slice-material";
import { IDisposable, ViewType } from "./types";
import { getGeometrySize, scanSliceZ } from "./utils";

import type { Editor } from "../../models";

export class Slice extends THREE.Mesh implements IDisposable {
  private baseSize = new THREE.Vector2();

  private workingVector = new THREE.Vector2();

  private disposers: IDisposer[] = [];

  constructor(
    private editor: Editor,
    private viewType: ViewType,
    private render: () => void,
  ) {
    super(
      new THREE.PlaneGeometry(),
      new SliceMaterial(editor, viewType, render),
    );

    this.userData = {
      viewType,
    };

    this.disposers.push(autorun(this.updateScale), autorun(this.updateOffset));
  }

  public dispose() {
    (this.material as SliceMaterial).dispose();
  }

  public setAtlas(atlas: TextureAtlas) {
    (this.material as SliceMaterial).setAtlas(atlas);

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

    this.position.set(this.workingVector.x, this.workingVector.y, scanSliceZ);

    this.render();
  };
}
