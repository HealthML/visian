import { RenderedImage } from "@visian/rendering";
import { IDocument, IImageLayer, MarkerConfig } from "@visian/ui-shared";
import {
  Image,
  ImageSnapshot,
  ISerializable,
  ITKImage,
  itkImageToImageSnapshot,
  TypedArray,
  Vector,
  ViewType,
  Voxel,
  VoxelWithValue,
  writeSingleMedicalImage,
} from "@visian/utils";
import FileSaver from "file-saver";
import { action, computed, makeObservable, observable } from "mobx";

import { defaultAnnotationColor } from "../../../../constants";
import { condenseValues } from "../../markers";
import { Layer, LayerSnapshot } from "../layer";
import { markerRPCProvider } from "./markers";
import {
  GetEmptySlicesArgs,
  GetEmptySlicesReturn,
  IsSliceEmptyArgs,
  IsSliceEmptyReturn,
} from "./types";

export interface ImageLayerSnapshot extends LayerSnapshot {
  image: ImageSnapshot;

  brightness: number;
  contrast: number;
}

export class ImageLayer
  extends Layer
  implements IImageLayer, ISerializable<ImageLayerSnapshot> {
  public static fromITKImage<T2 extends TypedArray = TypedArray>(
    image: ITKImage<T2>,
    document: IDocument,
    snapshot?: Partial<ImageLayerSnapshot>,
  ) {
    return new this(
      { ...snapshot, image: itkImageToImageSnapshot(image) },
      document,
    );
  }

  public static fromNewAnnotationForImage<T2 extends TypedArray = TypedArray>(
    image: Image<T2>,
    document: IDocument,
    color?: string,
  ) {
    return new this(
      {
        isAnnotation: true,
        color: color || defaultAnnotationColor,
        image: {
          atlas: new Uint8Array(image.getAtlas().length),
          name: `${image.name.split(".")[0]}_annotation`,
          dimensionality: image.dimensionality,
          origin: image.origin.toArray(),
          orientation: image.orientation,
          voxelCount: image.voxelCount.toArray(),
          voxelSpacing: image.voxelSpacing.toArray(),
        },
      },
      document,
    );
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static readonly kind = "image";
  public readonly kind = "image";

  public image!: RenderedImage;

  public brightness!: number;
  public contrast!: number;

  /**
   * An array of n-hot arrays indicating empty slices in the direction of every
   * view type.
   */
  protected emptySlices!: boolean[][];

  constructor(
    snapshot: Partial<ImageLayerSnapshot> & Pick<ImageLayerSnapshot, "image">,
    protected document: IDocument,
  ) {
    super(snapshot, document, true);
    this.applySnapshot(snapshot);
    this.excludeFromSnapshotTracking = [
      ...this.excludeFromSnapshotTracking,
      "emptySlices",
    ];

    makeObservable<this, "emptySlices" | "setEmptySlices" | "setIsSliceEmpty">(
      this,
      {
        image: observable,
        brightness: observable,
        contrast: observable,
        emptySlices: observable,

        is3DLayer: computed,

        setImage: action,
        setBrightness: action,
        setContrast: action,
        setEmptySlices: action,
        setIsSliceEmpty: action,
      },
    );
  }

  public get title(): string {
    return super.title || this.image.name;
  }

  public get is3DLayer() {
    return (
      this.image.voxelCount
        .toArray()
        .reduce((previous, current) => previous + (current > 1 ? 1 : 0), 0) > 2
    );
  }

  public setImage(value: RenderedImage): void {
    this.image = value;
  }

  public setBrightness(value?: number): void {
    this.brightness = value ?? 1;
  }

  public setContrast(value?: number): void {
    this.contrast = value ?? 1;
  }

  // Slice Markers
  public getSliceMarkers(viewType: ViewType): MarkerConfig[] {
    if (!this.is3DLayer || !this.isAnnotation || !this.isVisible) return [];

    const nonEmptySlices: number[] = [];
    this.emptySlices[viewType].forEach((isEmpty, slice) => {
      if (!isEmpty) nonEmptySlices.push(slice);
    });

    return condenseValues(nonEmptySlices).map((value) => ({
      context: this.id,
      color: this.color,
      value,
    }));
  }

  protected setEmptySlices(emptySlices?: boolean[][]): void {
    this.emptySlices =
      emptySlices ||
      this.image.voxelCount
        .toArray()
        .map((sliceCount) => new Array(sliceCount).fill(true));
  }

  protected isSliceEmpty(viewType: ViewType, slice: number): boolean {
    return (
      this.emptySlices[viewType].length <= slice ||
      this.emptySlices[viewType][slice]
    );
  }

  protected setIsSliceEmpty(
    viewType: ViewType,
    slice: number,
    isEmpty: boolean,
  ): void {
    if (this.emptySlices[viewType].length <= slice) return;
    this.emptySlices[viewType][slice] = isEmpty;
  }

  public async recomputeSliceMarkers(
    viewType?: ViewType,
    slice?: number,
    isDeleteOperation?: boolean,
  ): Promise<void> {
    if (!this.is3DLayer || !this.isAnnotation) return;

    if (viewType !== undefined && slice !== undefined) {
      // Recompute the given slice
      // The noop here is used to serialize worker calls to avoid race conditions
      await markerRPCProvider.rpc("noop");
      if (
        this.emptySlices[viewType].length <= slice ||
        (isDeleteOperation && this.isSliceEmpty(viewType, slice)) ||
        (isDeleteOperation === false && !this.isSliceEmpty(viewType, slice))
      ) {
        return;
      }

      // TODO: If multiple updates are queued for the same slice, only the latest
      // one should be executed
      const isEmpty = await markerRPCProvider.rpc<
        IsSliceEmptyArgs,
        IsSliceEmptyReturn
      >("isSliceEmpty", {
        sliceData: this.getSlice(viewType, slice),
      });

      this.setIsSliceEmpty(viewType, slice, isEmpty);
    } else {
      // Recompute all slices
      // TODO: If multiple updates are queued, only the latest one should be executed
      const emptySlices = await markerRPCProvider.rpc<
        GetEmptySlicesArgs,
        GetEmptySlicesReturn
      >("getEmptySlices", {
        atlas: this.image.getAtlas(),
        voxelCount: this.image.voxelCount.toArray(),
        voxelComponents: this.image.voxelComponents,
      });

      this.setEmptySlices(emptySlices);
    }
  }

  public async clearSliceMarkers(
    viewType?: ViewType,
    slice?: number,
  ): Promise<void> {
    if (!this.is3DLayer || !this.isAnnotation) return;

    // The noop here is used to serialize worker calls to avoid race conditions
    // TODO: A more elegant solution would be to cancel any outstanding worker
    // updates once clear is called
    await markerRPCProvider.rpc("noop");

    if (viewType !== undefined && slice !== undefined) {
      // Clear the given slice
      this.setIsSliceEmpty(viewType, slice, true);
    } else {
      // Clear all slices
      this.setEmptySlices();
    }
  }

  // Special Accessors
  public getVoxel(voxel: Voxel | Vector): Vector {
    return this.image.getVoxelData(voxel);
  }

  public setVoxel(voxel: Voxel | Vector, value: number): void {
    this.image.setAtlasVoxel(voxel, value);
  }

  public setVoxels(voxels: VoxelWithValue[]): void {
    this.image.setAtlasVoxels(voxels);
  }

  public getSlice(viewType: ViewType, slice: number): Uint8Array {
    return this.image.getSlice(viewType, slice);
  }

  public setSlice(
    viewType: ViewType,
    slice: number,
    sliceData: Uint8Array,
  ): void {
    this.image.setSlice(viewType, slice, sliceData);
  }

  public getAtlas(): Uint8Array {
    return this.image.getAtlas();
  }

  public setAtlas(atlas: Uint8Array): void {
    this.image.setAtlas(atlas);
  }

  // I/O
  public toFile() {
    return writeSingleMedicalImage(
      this.image.toITKImage(),
      `${this.title.split(".")[0]}.nii.gz`,
    );
  }
  public quickExport = async () => {
    if (this.image.dimensionality < 3) return this.quickExportSlice();
    const file = await this.toFile();

    if (!file) return;
    FileSaver.saveAs(file, file.name);
  };

  public quickExportSlice = async () => {
    const sliceImage = this.image.getSliceImage(
      this.document.viewport2D.mainViewType,
      this.document.viewport2D.getSelectedSlice(),
    );
    const file = await writeSingleMedicalImage(
      sliceImage.toITKImage(),
      `${sliceImage.name.split(".")[0]}.png`,
    );

    if (!file) return;
    FileSaver.saveAs(file, file.name);
  };

  // Serialization
  public toJSON(): ImageLayerSnapshot {
    return {
      ...super.toJSON(),
      image: this.image.toJSON(),
      brightness: this.brightness,
      contrast: this.contrast,
    };
  }

  public applySnapshot(
    snapshot: Partial<ImageLayerSnapshot> & Pick<ImageLayerSnapshot, "image">,
  ): Promise<void> {
    if (!snapshot.image) {
      throw new Error("Cannot load an image layer without an image");
    }

    super.applySnapshot(snapshot);
    this.setImage(new RenderedImage(snapshot.image, this.document));
    this.setBrightness(snapshot.brightness);
    this.setContrast(snapshot.contrast);

    this.setEmptySlices();
    return this.recomputeSliceMarkers();
  }
}
