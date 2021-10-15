import { Image } from "@visian/utils";
import * as THREE from "three";

export class ImageRenderTarget extends THREE.WebGLRenderTarget {
  constructor(
    image: Pick<Image, "voxelCount" | "voxelComponents">,
    filter: THREE.TextureFilter,
  ) {
    super(image.voxelCount.x, image.voxelCount.y, {
      magFilter: filter,
      minFilter: filter,
    });
    this.depth = image.voxelCount.z;

    const texture = new THREE.DataTexture3D(
      // The typings require a data buffer even though one isn't required...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      undefined as any,
      image.voxelCount.x,
      image.voxelCount.y,
      image.voxelCount.z,
    );
    texture.magFilter = filter;
    texture.minFilter = filter;
    this.setTexture(texture);
    texture.isRenderTargetTexture = true;
  }
}
