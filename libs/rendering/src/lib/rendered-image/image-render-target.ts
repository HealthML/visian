import { getPlaneAxes, Image } from "@visian/utils";
import * as THREE from "three";

export class ImageRenderTarget extends THREE.WebGLRenderTarget {
  constructor(
    image: Pick<Image, "voxelCount" | "is3D" | "defaultViewType">,
    filter: THREE.TextureFilter,
  ) {
    let widthAxis = "x";
    let heightAxis = "y";
    if (!image.is3D) {
      [widthAxis, heightAxis] = getPlaneAxes(image.defaultViewType);
    }

    super(
      image.voxelCount[widthAxis as "x" | "y" | "z"],
      image.voxelCount[heightAxis as "x" | "y" | "z"],
      {
        magFilter: filter,
        minFilter: filter,
      },
    );

    if (image.is3D) {
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
}
