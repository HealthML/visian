import { getPlaneAxes, Image } from "@visian/utils";
import * as THREE from "three";

export class ImageRenderTarget {
  public readonly is3D: boolean;
  public readonly target: THREE.WebGLRenderTarget;

  constructor(
    image: Pick<Image, "voxelCount" | "is3D" | "defaultViewType">,
    filter: THREE.TextureFilter,
  ) {
    this.is3D = image.is3D;

    if (image.is3D) {
      this.target = new THREE.WebGL3DRenderTarget(
        image.voxelCount.x,
        image.voxelCount.y,
        image.voxelCount.z,
      );
      this.target.texture.magFilter = filter;
      this.target.texture.minFilter = filter;
    } else {
      const [widthAxis, heightAxis] = getPlaneAxes(image.defaultViewType);
      this.target = new THREE.WebGLRenderTarget(
        image.voxelCount[widthAxis as "x" | "y" | "z"],
        image.voxelCount[heightAxis as "x" | "y" | "z"],
        {
          magFilter: filter,
          minFilter: filter,
          depthBuffer: false,
        },
      );
    }
  }
}
