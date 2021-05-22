import { IDocument, IImageLayer } from "@visian/ui-shared";
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
import { action, makeObservable, observable } from "mobx";

import { RenderedImage } from "../../../rendering/rendered-image";
import { Layer, LayerSnapshot } from "./layer";

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
  ) {
    return new this({ image: itkImageToImageSnapshot(image) }, document);
  }

  public static fromNewAnnotationForImage<T2 extends TypedArray = TypedArray>(
    image: Image<T2>,
    document: IDocument,
  ) {
    return new this(
      {
        image: {
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

  constructor(
    snapshot: Partial<ImageLayerSnapshot> & Pick<ImageLayerSnapshot, "image">,
    protected document: IDocument,
  ) {
    super(snapshot, document);

    makeObservable(this, {
      image: observable,
      brightness: observable,
      contrast: observable,

      setImage: action,
      setBrightness: action,
      setContrast: action,
    });
  }

  public get title(): string | undefined {
    return super.title || this.image.name;
  }

  public setImage(value: RenderedImage): void {
    this.image = value;
  }

  public setBrightness = (value?: number): void => {
    this.brightness = value ?? 1;
  };

  public setContrast = (value?: number): void => {
    this.contrast = value ?? 1;
  };

  // Special Accessors
  // TODO: Review regarding correct image component handling
  public getVoxel(voxel: Voxel | Vector): number {
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
  public quickExport = async () => {
    if (this.image.dimensionality < 3) return this.quickExportSlice();

    const file = await writeSingleMedicalImage(
      this.image.toITKImage(),
      `${this.image.name.split(".")[0]}.nii.gz`,
    );

    if (!file) return;
    FileSaver.saveAs(file, file.name);
  };

  public quickExportSlice = async () => {
    const sliceImage = this.image.getSliceImage(
      this.document.viewport2D.getSelectedSlice(),
      this.document.viewport2D.mainViewType,
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
    this.setImage(new RenderedImage(snapshot.image));
    this.setBrightness(snapshot.brightness);
    this.setContrast(snapshot.contrast);

    return Promise.resolve();
  }
}
