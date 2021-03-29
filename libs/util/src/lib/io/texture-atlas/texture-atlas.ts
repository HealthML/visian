import { ITKImage, TypedArray } from "@visian/util";
import localForage from "localforage";
import * as THREE from "three";

export class NoImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoImageError";
  }
}

export interface StoredTextureAtlas<T extends TypedArray = TypedArray> {
  atlas: T;
  direction: number[];
  magFilter?: THREE.TextureFilter;
  voxelCount: number[];
  voxelSpacing?: number[];
  components: number;
  dimensionality: number;
}

export const localForagePrefix = `atlas/`;

/**
 * The texture atlas generation expects the x- and y-axis to be inverted
 * and the z-axis to be non-inverted.
 */
export const defaultDirection = new THREE.Vector3(-1, -1, 1);

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
export class TextureAtlas<T extends TypedArray = TypedArray> {
  /** Returns a texture atlas based on the given medical image. */
  public static fromITKImage<T extends TypedArray = TypedArray>(
    image: ITKImage<T>,
    magFilter?: THREE.TextureFilter,
  ) {
    if (image.size.length !== 3) {
      throw new Error("Only 3D volumetric images are supported");
    }
    return new TextureAtlas<T>(
      new THREE.Vector3().fromArray(image.size),
      new THREE.Vector3().fromArray(image.spacing),
      new THREE.Matrix3().fromArray(image.direction.data),
      image.imageType.components,
      image.imageType.dimension,
      magFilter,
    ).setData(image.data);
  }

  /** Returns a texture atlas previously written to local storage. */
  public static async fromStorage<T extends TypedArray = TypedArray>(
    key: string,
  ) {
    const storedAtlas = await localForage.getItem<StoredTextureAtlas<T>>(
      `${localForagePrefix}${key}`,
    );
    if (!storedAtlas) return undefined;

    return new TextureAtlas<T>(
      new THREE.Vector3().fromArray(storedAtlas.voxelCount),
      storedAtlas.voxelSpacing &&
        new THREE.Vector3().fromArray(storedAtlas.voxelSpacing),
      new THREE.Matrix3().fromArray(storedAtlas.direction),
      storedAtlas.components,
      storedAtlas.dimensionality,
      storedAtlas.magFilter,
    ).setAtlas(storedAtlas.atlas);
  }

  /** Deletes a previously stored texture atlas from local storage.*/
  public static removeFromStorage(key: string) {
    return localForage.removeItem(`${localForagePrefix}${key}`);
  }

  /** The number of slices stored on the atlas in x and y direction. */
  public readonly atlasGrid: THREE.Vector2;

  /** The pixel size of the atlas in x and y direction. */
  public readonly atlasSize: THREE.Vector2;

  /** The original image data in I/O format. */
  protected data?: T;

  /** The 2D texture atlas. */
  protected atlas?: T;

  /** The THREE texture. Lazily generated. */
  protected texture?: THREE.DataTexture;

  constructor(
    /** The number of voxels of the original image in each direction. */
    public readonly voxelCount: THREE.Vector3,
    /** The spacing between each voxel. */
    public readonly voxelSpacing: THREE.Vector3 = new THREE.Vector3().setScalar(
      1,
    ),
    private direction: THREE.Matrix3,
    public readonly components: number,
    private dimensionality: number,
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
      if (!this.data) {
        throw new NoImageError(
          "No image data provided. Did you forget to call setData()?",
        );
      }

      this.atlas = new (this.data.constructor as new (size: number) => T)(
        this.atlasSize.x * this.atlasSize.y * this.components,
      );

      const direction =
        this.dimensionality < 3
          ? defaultDirection
          : new THREE.Vector3()
              .setScalar(1)
              .applyMatrix3(this.direction)
              .round()
              .multiply(defaultDirection);

      const inverted = {
        x: direction.x < 0,
        y: direction.y < 0,
        z: direction.z < 0,
      };

      const sliceSize = this.voxelCount.x * this.voxelCount.y * this.components;

      // TODO: Test if ordered read can improve performance here
      for (let z = 0; z < this.voxelCount.z; z++) {
        const sliceZ = inverted.z ? this.voxelCount.z - (z + 1) : z;
        const sliceData = this.data.subarray(
          sliceZ * sliceSize,
          (sliceZ + 1) * sliceSize,
        );
        const sliceOffset = new THREE.Vector2(
          (sliceZ % this.atlasGrid.x) * this.voxelCount.x * this.components,
          Math.floor(sliceZ / this.atlasGrid.x) *
            this.voxelCount.y *
            this.components,
        );

        for (let y = 0; y < this.voxelCount.y; y++) {
          const sliceY = inverted.y ? this.voxelCount.y - (y + 1) : y;
          for (let x = 0; x < this.voxelCount.x; x++) {
            const sliceX = inverted.x ? this.voxelCount.x - (x + 1) : x;
            for (let c = 0; c < this.components; c++) {
              this.atlas[
                this.components *
                  ((sliceOffset.y + sliceY) * this.atlasSize.x +
                    sliceOffset.x +
                    sliceX) +
                  c
              ] = sliceData[this.components * (y * this.voxelCount.x + x) + c];
            }
          }
        }
      }
    }

    return this.atlas;
  }

  /**
   * Returns the image data in I/O format.
   * Lazily generates it if necessary.
   */
  public getData() {
    // TODO: Adapt to this.components, this.dimensionality, and this.direction.
    if (!this.data) {
      if (!this.atlas) {
        throw new NoImageError(
          "No image data provided. Did you forget to call setAtlas()?",
        );
      }

      this.data = new (this.atlas.constructor as new (size: number) => T)(
        this.voxelCount.x * this.voxelCount.y * this.voxelCount.z,
      );
      const sliceSize = this.voxelCount.x * this.voxelCount.y;

      for (
        let sliceNumber = 0;
        sliceNumber < this.voxelCount.z;
        sliceNumber++
      ) {
        const sliceOffsetX =
          (sliceNumber % this.atlasGrid.x) * this.voxelCount.x;
        const sliceOffsetY =
          Math.floor(sliceNumber / this.atlasGrid.x) * this.voxelCount.y;
        const dataOffset = sliceNumber * sliceSize;

        for (let sliceY = 0; sliceY < this.voxelCount.y; sliceY++) {
          for (let sliceX = 0; sliceX < this.voxelCount.x; sliceX++) {
            this.data[
              dataOffset + sliceY * this.voxelCount.x + sliceX
            ] = this.atlas[
              (sliceOffsetY + sliceY) * this.atlasSize.x + sliceOffsetX + sliceX
            ];
          }
        }
      }
    }

    return this.data;
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

      const textureFormat: THREE.PixelFormat =
        this.components === 1
          ? THREE.LuminanceFormat
          : this.components === 2
          ? THREE.RGFormat
          : this.components === 3
          ? THREE.RGBFormat
          : THREE.RGBAFormat;

      this.texture = new THREE.DataTexture(
        scaledAtlas,
        this.atlasGrid.x * this.voxelCount.x,
        this.atlasGrid.y * this.voxelCount.y,
        textureFormat,
        undefined,
        undefined,
        undefined,
        undefined,
        this.magFilter,
      );
    }

    return this.texture;
  }

  /** Sets the image data based on the given 2D texture atlas. */
  public setAtlas(atlas: T) {
    this.data = undefined;
    this.texture = undefined;
    this.atlas = atlas;
    return this;
  }

  /** Sets the image data based on the given I/O format data. */
  public setData(data: T) {
    this.atlas = undefined;
    this.texture = undefined;
    this.data = data;
    return this;
  }

  /**
   * Writes this texture atlas to local storage.
   * It can be recreated later using `TextureAtlas.fromStorage(key)`.
   */
  public store(key: string) {
    return localForage.setItem(`${localForagePrefix}${key}`, {
      atlas: this.getAtlas(),
      direction: this.direction.toArray(),
      magFilter: this.magFilter,
      voxelCount: this.voxelCount.toArray(),
      voxelSpacing: this.voxelSpacing.toArray(),
      components: this.components,
      dimensionality: this.dimensionality,
    } as StoredTextureAtlas<T>);
  }
}

export default TextureAtlas;
