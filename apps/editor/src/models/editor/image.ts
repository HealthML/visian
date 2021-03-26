import {
  FloatTypes,
  IntTypes,
  ITKImage,
  ITKMatrix,
  VoxelTypes,
  readMedicalImage,
  TypedArray,
} from "@visian/util";
import { action, makeObservable, observable, toJS } from "mobx";

import { ISerializable } from "../types";

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

export class Image<T extends TypedArray = TypedArray>
  implements ISerializable<ImageSnapshot<T>> {
  public static fromITKImage<T extends TypedArray = TypedArray>(
    image: ITKImage<T>,
  ) {
    return new Image({
      name: image.name,
      dimensionality: image.imageType.dimension,
      voxelCount: image.size,
      voxelSpacing: image.spacing,
      voxelType: image.imageType.pixelType,
      voxelComponents: image.imageType.components,
      voxelComponentType: image.imageType.componentType,
      origin: image.origin,
      orientation: image.direction,
      data: image.data,
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
  public voxelCount!: number[];

  /**
   * An Array with length `dimensionality` that describes the spacing between
   * pixel in physical units.
   *
   * Defaults to a vector of all ones.
   */
  public voxelSpacing!: number[];

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
  public origin!: number[];

  /**
   * A `dimensionality` by `dimensionality` Matrix that describes the
   * orientation of the image at its origin. The orientation of each
   * axis are the orthonormal columns.
   *
   * Defaults to the identity matrix.
   */
  public orientation!: ITKMatrix;

  /** A TypedArray containing the voxel buffer data. */
  public data!: T;

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
    });
  }

  public toJSON() {
    return {
      name: this.name,
      voxelCount: toJS(this.voxelCount),
      voxelSpacing: toJS(this.voxelSpacing),
      origin: toJS(this.origin),
      orientation: this.orientation,
      data: this.data,
    };
  }

  public async applySnapshot(snapshot: ImageSnapshot<T>) {
    this.name = snapshot.name || "Image";

    this.dimensionality = snapshot.dimensionality || snapshot.voxelCount.length;

    this.voxelCount = snapshot.voxelCount;
    this.voxelSpacing = snapshot.voxelSpacing || this.voxelCount.map(() => 1);

    this.voxelType =
      snapshot.voxelType === undefined ? VoxelTypes.Scalar : snapshot.voxelType;
    this.voxelComponents = snapshot.voxelComponents || 1;
    this.voxelComponentType = snapshot.voxelComponentType || IntTypes.UInt8;

    this.origin = snapshot.origin || this.voxelCount.map(() => 0);
    if (snapshot.orientation) {
      this.orientation = snapshot.orientation;
    } else {
      this.orientation = new ITKMatrix(
        this.voxelCount.length,
        this.voxelCount.length,
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
      this.data = new Uint8Array(
        this.voxelCount.reduce((sum, current) => sum + current, 0),
      ) as T;
    }
  }
}
