import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import {
  FloatTypes,
  IntTypes,
  ITKImage,
  ITKMatrix,
  readMedicalImage,
  TypedArray,
  VoxelTypes,
} from "../../io";
import {
  convertDataArrayToAtlas,
  getAtlasGrid,
  getAtlasSize,
  getTextureFromAtlas,
} from "../../io/texture-atlas";
import { Vector } from "../vector";
import { getPlaneAxes, ViewType } from "../view-types";
import { getAtlasIndexFor, unifyOrientation } from "./conversion";
import { findVoxelInSlice } from "./iteration";

import type { ISerializable } from "../types";

export interface ImageSnapshot<T extends TypedArray = TypedArray> {
  name?: string;

  dimensionality?: number;

  voxelCount: number[];
  voxelSpacing?: number[];

  voxelType?: VoxelTypes;
  voxelComponents?: number;
  voxelComponentType?: FloatTypes | IntTypes;

  origin?: number[];
  orientation?: ITKMatrix;

  data?: T;
}

/** A generic, observable multi-dimensional image class. */
export class Image<T extends TypedArray = TypedArray>
  implements ISerializable<ImageSnapshot<T>> {
  public static fromITKImage<T extends TypedArray = TypedArray>(
    image: ITKImage<T>,
  ) {
    return new Image({
      name: image.name,
      dimensionality: image.imageType.dimension,
      voxelCount:
        image.imageType.dimension === 2 ? [...image.size, 1] : image.size,
      voxelSpacing:
        image.imageType.dimension === 2 ? [...image.spacing, 1] : image.spacing,
      voxelType: image.imageType.pixelType,
      voxelComponents: image.imageType.components,
      voxelComponentType: image.imageType.componentType,
      origin: image.origin,
      orientation: image.direction,
      data: unifyOrientation(
        image.data,
        image.direction,
        image.imageType.dimension,
        image.size,
        image.imageType.components,
      ),
    });
  }

  public static async fromFile(file: File) {
    return Image.fromITKImage(await readMedicalImage(file));
  }

  /**
   * An name that describes this image.
   *
   * Defaults to `"Image"`.
   */
  public name!: string;

  /** The number of dimensions the image has, typically 2 or 3. */
  public dimensionality!: number;

  /**
   * An Array with length `dimensionality` that contains the number of voxels
   * along each dimension.
   */
  public voxelCount!: Vector;

  /**
   * An Array with length `dimensionality` that describes the spacing between
   * pixel in physical units.
   *
   * Defaults to a vector of all ones.
   */
  public voxelSpacing!: Vector;

  /**
   * The VoxelType. For example, `VoxelTypes.Scalar` or `VoxelTypes.RGBA`.
   *
   * Defaults to `VoxelTypes.Scalar`.
   */
  public voxelType!: VoxelTypes;

  /**
   * The number of components in a voxel. For a Scalar `voxelType`,
   * this will be 1.
   *
   * Defaults to `1`.
   */
  public voxelComponents!: number;

  /**
   * The type of the components in a voxel. This is one of the `IntTypes` or
   * `FloatTypes`.
   *
   * Defaults to `IntTypes.UInt8`
   */
  public voxelComponentType!: FloatTypes | IntTypes;

  /**
   * An Array with length `dimensionality` that describes the location of the
   * center of the lower left pixel in physical units.
   *
   * Defaults to the zero vector.
   */
  public origin!: Vector;

  /**
   * A `dimensionality` by `dimensionality` Matrix that describes the
   * orientation of the image at its origin. The orientation of each
   * axis are the orthonormal columns.
   *
   * Defaults to the identity matrix.
   */
  public orientation!: ITKMatrix;

  /** A TypedArray containing the voxel buffer data in I/O format. */
  public data!: T;

  /** A Uint8Array containing the voxel buffer data in texture atlas format. */
  protected atlas?: Uint8Array;

  protected texture?: THREE.DataTexture;

  constructor(
    image: ImageSnapshot<T> & Pick<ImageSnapshot<T>, "voxelCount" | "data">,
  ) {
    this.applySnapshot(image);

    makeObservable(this, {
      name: observable,
      dimensionality: observable,
      voxelCount: observable,
      voxelSpacing: observable,
      voxelType: observable,
      voxelComponents: observable,
      voxelComponentType: observable,
      origin: observable,
      // TODO: Make matrix properly observable
      orientation: observable.ref,
      data: observable.ref,
      applySnapshot: action,
      setAtlas: action,
      updateData: action,
      setAtlasVoxel: action,
    });
  }

  public getAtlas() {
    if (!this.atlas) {
      // Explicit access here avoids MobX observability tracking to increase performance
      this.atlas = convertDataArrayToAtlas({
        data: this.data,
        dimensionality: this.dimensionality,
        orientation: this.orientation,
        voxelComponents: this.voxelComponents,
        voxelCount: this.voxelCount.clone(false),
      });
    }
    return this.atlas;
  }

  public getAtlasGrid() {
    return getAtlasGrid(this.voxelCount);
  }

  public getAtlasSize() {
    return getAtlasSize(this.voxelCount, this.getAtlasGrid());
  }

  public getTexture() {
    if (!this.texture) {
      // Explicit access here avoids MobX observability tracking to increase performance
      this.texture = getTextureFromAtlas(
        {
          voxelComponents: this.voxelComponents,
          voxelCount: this.voxelCount.clone(false),
        },
        this.getAtlas(),
        THREE.NearestFilter,
      );
    }
    return this.texture;
  }

  public getSlice(sliceNumber: number, viewType: ViewType) {
    const [horizontal, vertical] = getPlaneAxes(viewType);
    const sliceData = new Uint8Array(
      this.voxelCount[horizontal] * this.voxelCount[vertical],
    );

    let index = 0;
    // TODO: performance !!!
    findVoxelInSlice(
      this.getAtlas(),
      viewType,
      sliceNumber,
      (_, value) => {
        sliceData[index] = value;
        index++;
      },
      this.voxelComponents,
      this.voxelCount.clone(false),
      this.getAtlasSize(),
      this.getAtlasGrid(),
    );

    return sliceData;
  }

  public getVoxelData(voxel: Vector) {
    const index = getAtlasIndexFor(
      voxel,
      this.voxelComponents,
      this.voxelCount,
      this.getAtlasSize(),
      this.getAtlasGrid(),
    );
    return this.getAtlas()[index];
  }

  public toJSON() {
    return {
      name: this.name,
      voxelCount: this.voxelCount.toJSON(),
      voxelSpacing: this.voxelSpacing.toJSON(),
      origin: this.origin.toJSON(),
      orientation: this.orientation,
      data: this.data,
      dimensionality: this.dimensionality,
      voxelComponents: this.voxelComponents,
    };
  }

  public async applySnapshot(snapshot: ImageSnapshot<T>) {
    this.name = snapshot.name || "Image";

    this.dimensionality = snapshot.dimensionality || snapshot.voxelCount.length;

    this.voxelCount = Vector.fromArray(snapshot.voxelCount);
    this.voxelSpacing = snapshot.voxelSpacing
      ? Vector.fromArray(snapshot.voxelSpacing)
      : new Vector(this.dimensionality).setScalar(1);

    this.voxelType =
      snapshot.voxelType === undefined ? VoxelTypes.Scalar : snapshot.voxelType;
    this.voxelComponents = snapshot.voxelComponents || 1;
    this.voxelComponentType = snapshot.voxelComponentType || IntTypes.UInt8;

    this.origin = snapshot.origin
      ? Vector.fromArray(snapshot.origin)
      : new Vector(this.dimensionality).setScalar(0);

    if (snapshot.orientation) {
      this.orientation = snapshot.orientation;
    } else {
      this.orientation = new ITKMatrix(
        this.voxelCount.size,
        this.voxelCount.size,
      );
      this.orientation.setIdentity();
    }

    if (snapshot.data) {
      // Clone the data to convert it from a SharedArrayBuffer to an arraybuffer.
      // This is necessary to store the data in IndexedDB when using Chrome.
      const clonedData = new (snapshot.data.constructor as new (
        size: number,
      ) => T)(snapshot.data.length);
      clonedData.set(snapshot.data);
      this.data = clonedData;
    } else {
      this.data = new Uint8Array(this.voxelCount.product()) as T;
    }
  }

  public setAtlas(atlas: Uint8Array) {
    if (!this.atlas) {
      this.atlas = new Uint8Array(atlas);
    } else {
      this.atlas.set(atlas);
    }

    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }

  public updateData() {
    // update this.data from this.atlas
    console.log("updateData is not implemented yet");
  }

  public setAtlasVoxel(voxel: Vector, value: number) {
    const index = getAtlasIndexFor(
      voxel,
      this.voxelComponents,
      this.voxelCount,
      this.getAtlasSize(),
      this.getAtlasGrid(),
    );
    this.getAtlas()[index] = value;

    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }
}
