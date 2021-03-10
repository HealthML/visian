import { ITKImage, TypedArray } from "@visian/util";
import * as THREE from "three";

/**
 * Returns the optimal number of slices in x/y direction in the texture atlas.
 *
 * @param voxelCount The number of voxels in each direction.
 */
export const getAtlasGrid = (voxelCount: THREE.Vector3) => {
  const atlasGridX = Math.ceil(
    Math.sqrt((voxelCount.z * voxelCount.y) / voxelCount.x),
  );
  return new THREE.Vector2(atlasGridX, Math.ceil(voxelCount.z / atlasGridX));
};

/** A 2D texture atlas for a volumetric image. */
export class TextureAtlas {
  /** Returns a texture atlas based on the given medical image. */
  public static fromITKImage(image: ITKImage, magFilter?: THREE.TextureFilter) {
    if (image.size.length !== 3) {
      throw new Error("Only 3D volumetric images are supported");
    }
    return new TextureAtlas(
      image.data,
      new THREE.Vector3().fromArray(image.size),
      new THREE.Vector3().fromArray(image.spacing),
      magFilter,
    );
  }

  /** The number of slices stored on the atlas in x and y direction. */
  public readonly atlasGrid: THREE.Vector2;

  /** The pixel size of the atlas in x and y direction. */
  public readonly atlasSize: THREE.Vector2;

  protected atlas?: TypedArray;
  protected texture?: THREE.DataTexture;

  constructor(
    /** The original image data. */
    public readonly data: TypedArray,
    /** The number of voxels of the original image in each direction. */
    public readonly voxelCount: THREE.Vector3,
    /** The spacing between each voxel. */
    public readonly voxelSpacing: THREE.Vector3 = new THREE.Vector3().setScalar(
      1,
    ),
    private magFilter: THREE.TextureFilter = THREE.LinearFilter,
  ) {
    this.atlasGrid = getAtlasGrid(voxelCount);
    this.atlasSize = new THREE.Vector2(voxelCount.x, voxelCount.y).multiply(
      this.atlasGrid,
    );
  }

  /**
   * Returns the 2D texture atlas.
   * Lazily generates it if necessary.
   */
  public getAtlas() {
    if (!this.atlas) {
      this.atlas = new (this.data.constructor as new (
        size: number,
      ) => TypedArray)(this.atlasSize.x * this.atlasSize.y);

      const sliceSize = this.voxelCount.x * this.voxelCount.y;

      // TODO: Test if ordered read can improve performance here
      for (
        let sliceNumber = 0;
        sliceNumber < this.voxelCount.z;
        sliceNumber++
      ) {
        const sliceData = this.data.subarray(
          sliceNumber * sliceSize,
          (sliceNumber + 1) * sliceSize,
        );
        const sliceOffset = new THREE.Vector2(
          (sliceNumber % this.atlasGrid.x) * this.voxelCount.x,
          Math.floor(sliceNumber / this.atlasGrid.x) * this.voxelCount.y,
        );

        for (let sliceY = 0; sliceY < this.voxelCount.y; sliceY++) {
          for (let sliceX = 0; sliceX < this.voxelCount.x; sliceX++) {
            this.atlas[
              (sliceOffset.y + sliceY) * this.atlasSize.x +
                sliceOffset.x +
                sliceX
            ] = sliceData[sliceY * this.voxelCount.x + sliceX];
          }
        }
      }
    }

    return this.atlas;
  }

  /**
   * Returns the THREE texture for the atlas.
   * Lazily generates it if necessary.
   */
  public getTexture() {
    if (!this.texture) {
      // TODO: Implement 16+ bit support
      const maxValue = (this.getAtlas() as Uint8Array).reduce(
        (a: number, b: number) => Math.max(a, b),
        0,
      );
      const scaledAtlas = new Uint8Array(
        this.getAtlas().map((value: number) =>
          Math.round((Math.max(0, value) / maxValue) * 255),
        ),
      );

      this.texture = new THREE.DataTexture(
        scaledAtlas,
        this.atlasGrid.x * this.voxelCount.x,
        this.atlasGrid.y * this.voxelCount.y,
        THREE.LuminanceFormat,
        undefined,
        undefined,
        undefined,
        undefined,
        this.magFilter,
      );
    }

    return this.texture;
  }
}

export default TextureAtlas;
