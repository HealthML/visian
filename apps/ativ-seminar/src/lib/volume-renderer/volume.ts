import { ITKImage } from "@visian/util";
import * as THREE from "three";

import { generateTextureAtlas, getAtlasGrid } from "./utils";
import VolumeMaterial from "./volume-material";

class Volume extends THREE.Mesh {
  constructor() {
    super(new THREE.BoxBufferGeometry(1, 1, 1), new VolumeMaterial());

    // Keep the geometry a 1 by 1 by 1 box and use this
    // to scale according to the real volume dimensions.
    this.scale.set(2, 2, 2);
    this.rotateX(-Math.PI / 2);
  }

  public setImage(image: ITKImage) {
    // TODO: Implement 16+ bit support
    const originalAtlas = generateTextureAtlas(image);
    const maxValue = (originalAtlas as Uint8Array).reduce(
      (a: number, b: number) => Math.max(a, b),
      0,
    );
    const textureAtlas = new Uint8Array(
      originalAtlas.map((value: number) =>
        Math.round((Math.max(0, value) / maxValue) * 255),
      ),
    );

    const voxelCount = new THREE.Vector3().fromArray(image.size);
    const atlasGrid = getAtlasGrid(voxelCount);

    const scanTexture = new THREE.DataTexture(
      textureAtlas,
      atlasGrid.x * voxelCount.x,
      atlasGrid.y * voxelCount.y,
      THREE.LuminanceFormat,
    );
    const material = this.material as VolumeMaterial;
    material.texture = scanTexture;
    material.voxelCount = voxelCount;
    material.atlasGrid = atlasGrid;

    this.scale.copy(
      new THREE.Vector3()
        .fromArray(image.size)
        .multiply(new THREE.Vector3().fromArray(image.spacing))
        .multiplyScalar(0.01),
    );
  }

  public updateCameraPosition(camera: THREE.Camera) {
    (this.material as VolumeMaterial).updateCameraPosition(this, camera);
  }
}

export default Volume;
