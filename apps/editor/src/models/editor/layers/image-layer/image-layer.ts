import { generateHistogram, RenderedImage } from "@visian/rendering";
import {
  Histogram,
  IDocument,
  IImageLayer,
  MarkerConfig,
} from "@visian/ui-shared";
import {
  IDisposable,
  Image,
  ImageSnapshot,
  ISerializable,
  itkImageToImageSnapshot,
  ITKImageWithUnit,
  Vector,
  ViewType,
  Voxel,
  writeSingleMedicalImage,
} from "@visian/utils";
import FileSaver from "file-saver";
import { action, computed, makeObservable, observable } from "mobx";

import { defaultAnnotationColor } from "../../../../constants";
import { condenseValues } from "../../markers";
import { Layer, LayerSnapshot } from "../layer";
import { markerRPCProvider } from "./markers";
import {
  GetAreaArgs,
  GetAreaReturn,
  GetEmptySlicesArgs,
  GetEmptySlicesReturn,
  GetVolumeArgs,
  GetVolumeReturn,
  IsSliceEmptyArgs,
  IsSliceEmptyReturn,
} from "./types";
import { volumeRPCProvider } from "./volume";

export interface ImageLayerSnapshot extends LayerSnapshot {
  image: ImageSnapshot;

  brightness: number;
  contrast: number;
}

export class ImageLayer
  extends Layer
  implements IImageLayer, ISerializable<ImageLayerSnapshot>, IDisposable
{
  public static fromITKImage(
    image: ITKImageWithUnit,
    document: IDocument,
    snapshot?: Partial<ImageLayerSnapshot>,
    filterValue?: number,
    squash?: boolean,
  ) {
    return new this(
      {
        ...snapshot,
        image: itkImageToImageSnapshot(image, filterValue, squash),
      },
      document,
    );
  }

  public static fromNewAnnotationForImage(
    image: Image,
    document: IDocument,
    color?: string,
  ) {
    return new this(
      {
        isAnnotation: true,
        color: color || defaultAnnotationColor,
        image: {
          name: `${image.name.split(".")[0]}_annotation`,
          dimensionality: image.dimensionality,
          origin: image.origin.toArray(),
          orientation: image.orientation,
          voxelCount: image.voxelCount.toArray(),
          voxelSpacing: image.voxelSpacing.toArray(),
          unit: image.unit,
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

  public densityHistogram?: Histogram;
  public gradientHistogram?: Histogram;

  /**
   * An array of n-hot arrays indicating empty slices in the direction of every
   * view type.
   */
  protected emptySlices!: boolean[][];

  public volume: number | null = null;
  public area: {
    viewType: ViewType;
    slice: number;
    area: number;
  } | null = null;

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

    makeObservable<
      this,
      | "emptySlices"
      | "setEmptySlices"
      | "setIsSliceEmpty"
      | "setVolume"
      | "setArea"
    >(this, {
      image: observable,
      brightness: observable,
      contrast: observable,
      emptySlices: observable,
      volume: observable,
      area: observable,
      densityHistogram: observable.ref,
      gradientHistogram: observable.ref,

      is3DLayer: computed,

      setImage: action,
      setBrightness: action,
      setContrast: action,
      setEmptySlices: action,
      setIsSliceEmpty: action,
      setVolume: action,
      setArea: action,
      setGradientHistogram: action,
    });
  }

  public dispose() {
    this.image.dispose();
  }

  public get title(): string {
    return super.title || this.image.name;
  }

  public get is3DLayer() {
    return this.image.is3D;
  }

  public setImage(value: RenderedImage): void {
    this.image = value;
    if (this.document.performanceMode === "high") {
      this.densityHistogram = generateHistogram(value.getData());
    }
  }

  public setBrightness(value?: number): void {
    this.brightness = value ?? 1;
  }

  public setContrast(value?: number): void {
    this.contrast = value ?? 1;
  }

  public setGradientHistogram(histogram: Histogram) {
    this.gradientHistogram = histogram;
  }

  public delete() {
    super.delete();
    this.dispose();
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

  protected setVolume(volume: number | null = null) {
    this.volume = volume;
  }

  public async computeVolume() {
    this.setVolume();

    if (!this.isAnnotation) return;

    const volume = await volumeRPCProvider.rpc<GetVolumeArgs, GetVolumeReturn>(
      "getVolume",
      {
        data: this.image.getTextureData() as Uint8Array,
        voxelCount: this.image.voxelCount.toArray(),
        voxelComponents: this.image.voxelComponents,
        voxelSpacing: this.image.voxelSpacing.toArray(),
      },
    );

    this.setVolume(volume);
  }

  protected setArea(
    area: {
      viewType: ViewType;
      slice: number;
      area: number;
    } | null = null,
  ) {
    this.area = area;
  }

  public async computeArea(viewType: ViewType, slice: number) {
    this.setArea();

    if (!this.isAnnotation) return;

    const area = await volumeRPCProvider.rpc<GetAreaArgs, GetAreaReturn>(
      "getArea",
      {
        data: this.image.getTextureData() as Uint8Array,
        voxelCount: this.image.voxelCount.toArray(),
        voxelComponents: this.image.voxelComponents,
        voxelSpacing: this.image.voxelSpacing.toArray(),
        viewType,
        slice,
      },
    );

    this.setArea({ area, viewType, slice });
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
        data: this.image.getTextureData() as Uint8Array,
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

  // I/O
  public toFile(): Promise<File | undefined> {
    return writeSingleMedicalImage(
      this.image.toITKImage(
        this.document
          .getExcludedSegmentations(this)
          ?.map((imageLayer) => imageLayer.image),
      ),
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
      sliceImage.toITKImage(
        this.document
          .getExcludedSegmentations(this)
          ?.map((imageLayer) =>
            imageLayer.image.getSliceImage(
              this.document.viewport2D.mainViewType,
              this.document.viewport2D.getSelectedSlice(),
            ),
          ),
      ),
      `${sliceImage.name.split(".")[0]}.png`,
    );

    if (!file) return;
    FileSaver.saveAs(file, file.name);
  };

  public setIsAnnotation(value?: boolean): void {
    if (Boolean(value) !== this.isAnnotation && this.image) {
      const imageSnapshot = this.image.toJSON();

      this.image.dispose();

      this.setImage(
        new RenderedImage(imageSnapshot, this.document, Boolean(value)),
      );
    }

    super.setIsAnnotation(value);
  }

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
    this.setImage(
      new RenderedImage(
        snapshot.image,
        this.document,
        Boolean(snapshot.isAnnotation),
      ),
    );
    this.setBrightness(snapshot.brightness);
    this.setContrast(snapshot.contrast);

    this.setEmptySlices();
    return this.recomputeSliceMarkers();
  }
}
