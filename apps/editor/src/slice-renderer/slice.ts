import { TextureAtlas } from "@visian/util";
import { autorun } from "mobx";
import { IDisposer } from "mobx-utils/lib/utils";
import * as THREE from "three";

import { Editor } from "../models";
import { SliceMaterial } from "./slice-material";
import { IDisposable, ViewType } from "./types";
import { getGeometrySize, scanSliceZ } from "./utils";

export class Slice extends THREE.Mesh implements IDisposable {
  private baseSize = new THREE.Vector2();

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
    if (this.viewType !== this.editor.mainView) return;

    this.scale.set(
      this.baseSize.x * this.editor.zoomLevel,
      this.baseSize.y * this.editor.zoomLevel,
      1,
    );

    this.render();
  };

  private updateOffset = () => {
    this.position.set(this.editor.offset.x, this.editor.offset.y, scanSliceZ);

    this.render();
  };
}
