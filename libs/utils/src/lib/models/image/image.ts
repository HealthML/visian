import { action, computed, makeObservable, observable } from "mobx";
import type { Unit } from "nifti-js";

import {
  FloatTypes,
  IntTypes,
  ITKImage,
  ITKImageType,
  ITKMatrix,
  TypedArray,
  VoxelTypes,
} from "../../io";
import { Voxel } from "../../types";
import type { ISerializable } from "../types";
import { Vector } from "../vector";
import {
  getPlaneAxes,
  getViewTypeInitials,
  ViewType,
  viewTypeDepthThreshold,
} from "../view-types";
import {
  calculateNewOrientation,
  swapAxesForMetadata,
  unifyOrientation,
} from "./conversion";
import { findVoxelInSlice, setSlice } from "./iteration";

export interface ImageSnapshot {
  name?: string;

  dimensionality?: number;

  voxelCount: number[];
  voxelSpacing?: number[];

  voxelType?: VoxelTypes;
  voxelComponents?: number;
  voxelComponentType?: FloatTypes | IntTypes;

  origin?: number[];
  orientation?: ITKMatrix;

  data?: Uint8Array | Float32Array | TypedArray;

  unit?: Unit;
}

export interface ITKImageWithUnit extends ITKImage {
  unit?: Unit;
}

export const itkImageToImageSnapshot = (
  image: ITKImageWithUnit,
  filterValue?: number,
  squash?: boolean,
): ImageSnapshot => ({
  name: image.name,
  dimensionality: image.imageType.dimension,
  voxelCount:
    image.imageType.dimension === 2
      ? [...image.size, 1]
      : swapAxesForMetadata(image.size, image.direction),
  voxelSpacing:
    image.imageType.dimension === 2
      ? [...image.spacing, 1]
      : swapAxesForMetadata(image.spacing, image.direction),
  voxelType: image.imageType.pixelType,
  voxelComponents: image.imageType.components,
  voxelComponentType: image.imageType.componentType,
  origin: image.origin,
  orientation:
    image.imageType.dimension === 2
      ? image.direction
      : calculateNewOrientation(image.direction),
  data: unifyOrientation(
    image.data,
    image.direction,
    image.imageType.dimension,
    image.size,
    image.imageType.components,
    // Segmentations should only contain values 0 and 255
  ).map((value) =>
    filterValue === undefined
      ? squash && value
        ? 255
        : value
      : value === filterValue
      ? 255
      : 0,
  ),
  unit: image.unit,
});

/** A generic, observable multi-dimensional image class. */
export class Image implements ISerializable<ImageSnapshot> {
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

  /**
   * The unit of measurment for `voxelSpacing`.
   */
  public unit?: Unit;

  /** A TypedArray containing the voxel buffer data in I/O format. */
  private data!: Uint8Array | Float32Array;

  constructor(
    image: ImageSnapshot & Pick<ImageSnapshot, "voxelCount" | "data">,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.applySnapshot(image as any);

    makeObservable<this, "data">(this, {
      name: observable,
      dimensionality: observable,
      voxelCount: observable,
      voxelSpacing: observable,
      voxelType: observable,
      voxelComponents: observable,
      voxelComponentType: observable,
      origin: observable,
      unit: observable,
      // TODO: Make matrix properly observable
      orientation: observable.ref,
      data: observable.ref,
      is3D: computed,
      defaultViewType: computed,
      applySnapshot: action,
      setData: action,
      setSlice: action,
    });
  }

  public get is3D() {
    return (
      this.voxelCount
        .toArray()
        .reduce((previous, current) => previous + (current > 1 ? 1 : 0), 0) > 2
    );
  }

  public get defaultViewType() {
    if (!this.is3D) {
      const bestViewType = [
        ViewType.Transverse,
        ViewType.Sagittal,
        ViewType.Coronal,
      ].find((viewType) => this.voxelCount.getFromView(viewType) <= 1);
      return bestViewType ?? ViewType.Transverse;
    }

    let bestViewType = ViewType.Transverse;
    let bestViewTypeDepth = this.voxelSpacing.getFromView(bestViewType);

    [ViewType.Sagittal, ViewType.Coronal].forEach((viewType) => {
      const viewTypeDepth = this.voxelSpacing.getFromView(viewType);
      if (viewTypeDepth - bestViewTypeDepth > viewTypeDepthThreshold) {
        bestViewType = viewType;
        bestViewTypeDepth = viewTypeDepth;
      }
    });
    return bestViewType;
  }

  public getData() {
    return this.data;
  }

  public getSlice(viewType: ViewType, sliceNumber: number) {
    const [horizontal, vertical] = getPlaneAxes(viewType);
    const sliceData = new Uint8Array(
      this.voxelCount[horizontal] *
        this.voxelCount[vertical] *
        this.voxelComponents,
    );

    let index = 0;
    // TODO: performance !!!
    findVoxelInSlice(
      // Explicit access here avoids MobX observability tracking to decrease performance
      {
        voxelComponents: this.voxelComponents,
        voxelCount: this.voxelCount.clone(false),
      },
      this.getData(),
      viewType,
      sliceNumber,
      (_, value) => {
        for (let c = 0; c < this.voxelComponents; c++) {
          sliceData[index + c] = value.getComponent(c);
          index++;
        }
      },
    );

    return sliceData;
  }

  public getSliceImage(viewType: ViewType, sliceNumber: number): Image {
    if (this.dimensionality < 3) return this.clone();

    const [horizontal, vertical] = getPlaneAxes(viewType);
    return new Image({
      name: `${this.name.split(".")[0]}_${getViewTypeInitials(
        viewType,
      ).toLowerCase()}${sliceNumber}`,
      // TODO: Origin & orientation
      voxelCount: [this.voxelCount[horizontal], this.voxelCount[vertical]],
      voxelSpacing: [
        this.voxelSpacing[horizontal],
        this.voxelSpacing[vertical],
      ],
      data: this.getSlice(viewType, sliceNumber),
    });
  }

  public getVoxelData(voxel: Voxel | Vector) {
    const index = this.getDataIndex(voxel);

    return new Vector(
      Array.from(this.getData().slice(index, index + this.voxelComponents)),
      false,
    );
  }

  public setData(data: TypedArray | Uint8Array | Float32Array) {
    if (data === this.data) return;

    if (!this.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxValue = (data as any).reduce(
        (a: number, b: number) => Math.max(a, b),
        0,
      );

      if (data.BYTES_PER_ELEMENT === 1) {
        this.data = new Uint8Array(
          data.map((value: number) =>
            Math.round((Math.max(0, value) / maxValue) * 255),
          ),
        );
        this.voxelComponentType = IntTypes.UInt8;
      } else {
        this.data = new Float32Array(data).map(
          (value: number) => Math.max(0, value) / maxValue,
        );
        this.voxelComponentType = FloatTypes.Float32;
      }
    } else {
      if (data.length !== this.data.length) {
        throw new Error("Data length has changed");
      }
      this.data.set(data);
    }
  }

  public setSlice(viewType: ViewType, slice: number, sliceData?: Uint8Array) {
    setSlice(this, this.getData(), viewType, slice, sliceData);
  }

  public toITKImage(excludedImages?: Image[]) {
    const image = new ITKImage<Uint8Array | Float32Array>(
      new ITKImageType(
        this.dimensionality,
        this.voxelComponentType,
        this.voxelType,
        this.voxelComponents,
      ),
    );

    image.name = this.name;
    image.origin = this.origin.toArray();
    image.spacing =
      this.dimensionality === 2
        ? this.voxelSpacing.toArray()
        : swapAxesForMetadata(this.voxelSpacing.toArray(), this.orientation);
    image.direction =
      this.dimensionality === 2
        ? this.orientation
        : calculateNewOrientation(this.orientation);
    image.size =
      this.dimensionality === 2
        ? this.voxelCount.toArray()
        : swapAxesForMetadata(this.voxelCount.toArray(), this.orientation);

    // Clone the data array to protect it from modifications
    // & enable hand-off to web workers
    image.data = this.getData();

    if (excludedImages) {
      const excludedData = excludedImages.map((excludedImage) =>
        excludedImage.getData(),
      );
      image.data = image.data.map((value, index) =>
        excludedData.some((data) => data[index] > 0) ? 0 : value,
      ) as typeof image.data;
    }

    image.data = unifyOrientation(
      new (image.data.constructor as new (data: Uint8Array | Float32Array) =>
        | Uint8Array
        | Uint16Array)(image.data),
      this.orientation,
      this.dimensionality,
      this.voxelCount.toArray(),
      this.voxelComponents,
      false,
    ) as Uint8Array | Float32Array;

    return image;
  }

  public toJSON() {
    if (!this.data) {
      throw new Error("Saving image without any data");
    }
    return {
      name: this.name,
      voxelCount: this.voxelCount.toJSON(),
      voxelSpacing: this.voxelSpacing.toJSON(),
      origin: this.origin.toJSON(),
      orientation: this.orientation,
      data: this.getData(),
      dimensionality: this.dimensionality,
      voxelComponents: this.voxelComponents,
      voxelComponentType: this.voxelComponentType,
      voxelType: this.voxelType,
      unit: this.unit,
    };
  }

  public async applySnapshot(snapshot: ImageSnapshot) {
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

    this.unit = snapshot?.unit;

    this.setData(snapshot.data ?? new Uint8Array(this.voxelCount.product()));
  }

  public clone() {
    return new Image(this.toJSON());
  }

  protected getDataIndex(voxel: Voxel) {
    return (
      (voxel.x +
        voxel.y * this.voxelCount.x +
        voxel.z * this.voxelCount.x * this.voxelCount.y) *
      this.voxelComponents
    );
  }
}
