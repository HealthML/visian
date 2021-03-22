import { TextureAtlas } from "@visian/util";
import * as THREE from "three";

import { Editor } from "../models";
import { SliceMaterial } from "./slice-material";
import { IDisposable, ViewType } from "./types";
import { getGeometrySize, scanSliceZ } from "./utils";

export class Slice extends THREE.Mesh implements IDisposable {
  constructor(editor: Editor, private viewType: ViewType) {
    super(new THREE.PlaneGeometry(), new SliceMaterial(editor, viewType));

    this.userData = {
      viewType,
    };

    this.position.z = scanSliceZ;
  }

  public dispose() {
    (this.material as SliceMaterial).dispose();
  }

  public setAtlas(atlas: TextureAtlas) {
    (this.material as SliceMaterial).setAtlas(atlas);

    const geometrySize = getGeometrySize(atlas.voxelCount, this.viewType);
    // TODO: Take zoom into account.
    this.scale.set(geometrySize.x, geometrySize.y, 1);
  }
}
