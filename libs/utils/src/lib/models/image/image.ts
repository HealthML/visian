import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import {
  FloatTypes,
  IntTypes,
  ITKImage,
  ITKImageType,
  ITKMatrix,
  readMedicalImage,
  TypedArray,
  VoxelTypes,
} from "../../io";
import {
  convertAtlasToDataArray,
  convertDataArrayToAtlas,
  getAtlasGrid,
  getAtlasIndexFor,
  getAtlasSize,
  getTextureFromAtlas,
} from "../../io/texture-atlas";
import { Vector } from "../vector";
import { getPlaneAxes, getViewTypeInitials, ViewType } from "../view-types";
import { unifyOrientation } from "./conversion";
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
  atlas?: Uint8Array;
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
    const image = Image.fromITKImage(await readMedicalImage(file));
    image.name = file.name;
    return image;
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
  private data!: T;
  protected isDataDirty?: boolean;

  /** A Uint8Array containing the voxel buffer data in texture atlas format. */
  private atlas?: Uint8Array;
  protected isAtlasDirty?: boolean;

  protected texture?: THREE.DataTexture;

  constructor(
    image: ImageSnapshot<T> & Pick<ImageSnapshot<T>, "voxelCount" | "data">,
  ) {
    this.applySnapshot(image);

    makeObservable<this, "data" | "atlas" | "isDataDirty" | "isAtlasDirty">(
      this,
      {
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
        isDataDirty: observable,
        atlas: observable.ref,
        isAtlasDirty: observable,
        applySnapshot: action,
        setData: action,
        setAtlas: action,
        setAtlasVoxel: action,
        setSlice: action,
      },
    );
  }

  public getData() {
    if (!this.data || this.isDataDirty) {
      if (!this.atlas) throw new Error("No atlas provided");

      // Explicit access here avoids MobX observability tracking to decrease performance
      this.data = convertAtlasToDataArray(
        this.atlas,
        {
          voxelComponents: this.voxelComponents,
          voxelCount: this.voxelCount.clone(false),
        },
        this.data,
      );
      this.isDataDirty = false;
    }
    return this.data;
  }

  public getAtlas() {
    if (!this.atlas || this.isAtlasDirty) {
      if (!this.data) throw new Error("No data provided");

      // Explicit access here avoids MobX observability tracking to decrease performance
      this.atlas = convertDataArrayToAtlas(
        this.data,
        {
          voxelComponents: this.voxelComponents,
          voxelCount: this.voxelCount.clone(false),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.atlas as any,
      );
      this.isAtlasDirty = false;
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
      // Explicit access here avoids MobX observability tracking to decrease performance
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
      // Explicit access here avoids MobX observability tracking to decrease performance
      {
        getAtlas: () => this.getAtlas(),
        voxelComponents: this.voxelComponents,
        voxelCount: this.voxelCount.clone(false),
      },
      viewType,
      sliceNumber,
      (_, value) => {
        sliceData[index] = value;
        index++;
      },
    );

    return sliceData;
  }

  public getSliceImage(
    sliceNumber: number,
    viewType: ViewType,
  ): Image<T | Uint8Array> {
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
      data: this.getSlice(sliceNumber, viewType),
    });
  }

  public getVoxelData(voxel: Vector) {
    const index = getAtlasIndexFor(voxel, this);
    return this.getAtlas()[index];
  }

  public setData(data: T) {
    this.isDataDirty = false;
    this.isAtlasDirty = true;

    if (data === this.data) return;

    if (!this.data) {
      // Clone the data to convert it from a SharedArrayBuffer to an arraybuffer.
      // This is necessary to store the data in IndexedDB when using Chrome.
      this.data = new (data.constructor as new (data: T) => T)(data);
    } else {
      if (data.length !== this.data.length) {
        throw new Error("Data length has changed");
      }
      this.data.set(data);
    }
  }

  public setAtlas(atlas: Uint8Array) {
    this.isDataDirty = true;
    this.isAtlasDirty = false;

    if (atlas === this.atlas) return;

    if (!this.atlas) {
      this.atlas = new Uint8Array(atlas);
    } else {
      if (atlas.length !== this.atlas.length) {
        throw new Error("Atlas length has changed");
      }
      this.atlas.set(atlas);
    }

    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }

  public setAtlasVoxel(voxel: Vector, value: number) {
    const index = getAtlasIndexFor(voxel, this);
    this.getAtlas()[index] = value;

    this.isDataDirty = true;
    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }

  public setSlice(viewType: ViewType, slice: number, sliceData?: Uint8Array) {
    const atlas = this.getAtlas();

    const [horizontalAxis, verticalAxis] = getPlaneAxes(viewType);
    const sliceWidth = this.voxelCount[horizontalAxis];

    findVoxelInSlice(
      {
        getAtlas: () => this.getAtlas(),
        voxelComponents: this.voxelComponents,
        voxelCount: this.voxelCount.clone(false),
      },
      viewType,
      slice,
      (voxel, _, index) => {
        const sliceIndex =
          voxel[verticalAxis] * sliceWidth + voxel[horizontalAxis];
        atlas[index] = sliceData ? sliceData[sliceIndex] : 0;
      },
    );

    this.isDataDirty = true;
    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }

  public toITKImage() {
    const image = new ITKImage<T>(
      new ITKImageType(
        this.dimensionality,
        this.voxelComponentType,
        this.voxelType,
        this.voxelComponents,
      ),
    );

    image.name = this.name;
    image.origin = this.origin.toArray();
    image.spacing = this.voxelSpacing.toArray();
    image.direction = this.orientation;
    image.size = this.voxelCount.toArray();

    // Clone the data array to protect it from modifications
    // & enable hand-off to web workers
    image.data = this.getData();
    image.data = unifyOrientation(
      new (image.data.constructor as new (data: T) => T)(image.data),
      image.direction,
      image.imageType.dimension,
      image.size,
      image.imageType.components,
    ) as T;

    return image;
  }

  public toJSON() {
    if (
      (!this.data || this.isDataDirty) &&
      (!this.atlas || this.isAtlasDirty)
    ) {
      throw new Error("Saving image without any data");
    }
    return {
      name: this.name,
      voxelCount: this.voxelCount.toJSON(),
      voxelSpacing: this.voxelSpacing.toJSON(),
      origin: this.origin.toJSON(),
      orientation: this.orientation,
      data: this.isDataDirty || !this.isAtlasDirty ? undefined : this.data,
      atlas: this.isAtlasDirty ? undefined : this.atlas,
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
      this.setData(snapshot.data);
    } else if (snapshot.atlas) {
      this.setAtlas(snapshot.atlas);
    } else {
      this.setData(new Uint8Array(this.voxelCount.product()) as T);
    }
  }

  public clone() {
    return new Image(this.toJSON());
  }
}
