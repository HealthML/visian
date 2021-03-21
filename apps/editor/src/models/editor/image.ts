import {
  ITKImage,
  ITKMatrix,
  readMedicalImage,
  TypedArray,
} from "@visian/util";
import { action, makeObservable, observable, toJS } from "mobx";

import { ISerializable } from "../types";

export interface ImageSnapshot<T extends TypedArray = TypedArray> {
  name: string;

  voxelCount: number[];
  voxelSpacing: number[];

  origin: number[];
  orientation: ITKMatrix;

  data: T;
}

export class Image<T extends TypedArray = TypedArray>
  implements ISerializable<ImageSnapshot<T>> {
  public static fromITKImage<T extends TypedArray = TypedArray>(
    image: ITKImage<T>,
  ) {
    return new Image({
      name: image.name,
      voxelCount: image.size,
      voxelSpacing: image.spacing,
      origin: image.origin,
      orientation: image.direction,
      data: image.data,
    });
  }

  public static async fromFile(file: File) {
    return Image.fromITKImage(await readMedicalImage(file));
  }

  /**
   * An optional name that describes this image.
   *
   * Defaults to `"Image"`.
   */
  public name: string;

  /**
   * An Array with length dimension that contains the number of voxels along
   * each dimension.
   */
  public voxelCount: number[];

  /**
   * An Array with length dimension that describes the spacing between pixel
   * in physical units.
   *
   * Defaults to a vector of all ones.
   */
  public voxelSpacing: number[];

  /**
   * An Array with length dimension that describes the location of the center
   * of the lower left pixel in physical units.
   *
   * Defaults to the zero vector.
   */
  public origin: number[];

  /**
   * A dimension by dimension Matrix that describes the orientation of the
   * image at its origin. The orientation of each axis are the orthonormal
   * columns.
   *
   * Defaults to the identity matrix.
   */
  public orientation: ITKMatrix;

  /** A TypedArray containing the voxel buffer data. */
  public data: T;

  constructor(
    image: Partial<ImageSnapshot<T>> &
      Pick<ImageSnapshot<T>, "voxelCount" | "data">,
  ) {
    this.name = image.name || "Image";

    this.voxelCount = image.voxelCount;
    this.voxelSpacing = image.voxelSpacing || this.voxelCount.map(() => 1);

    this.origin = image.origin || this.voxelCount.map(() => 0);
    if (image.orientation) {
      this.orientation = image.orientation;
    } else {
      this.orientation = new ITKMatrix(
        this.voxelCount.length,
        this.voxelCount.length,
      );
      this.orientation.setIdentity();
    }

    this.data = image.data;

    makeObservable(this, {
      name: observable,
      voxelCount: observable,
      voxelSpacing: observable,
      origin: observable,
      orientation: observable.ref,
      // TODO: Make matrix properly observable
      data: observable.ref,
      rehydrate: action,
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

  public async rehydrate(snapshot: ImageSnapshot<T>) {
    (Object.keys(snapshot) as (keyof ImageSnapshot<T>)[]).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this[key] = snapshot[key] as any;
    });
  }
}
