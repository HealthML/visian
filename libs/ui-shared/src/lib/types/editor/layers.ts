import type {
  BackendMetadata,
  Image,
  Vector,
  ViewType,
  Voxel,
} from "@visian/utils";
import type { Matrix4 } from "three";

import { MarkerConfig } from "./markers";
import { Histogram } from "./types";

/**
 * The supported layer blending modes
 * @see https://helpx.adobe.com/photoshop/using/blending-modes.html
 */
export type BlendMode =
  | "COLOR"
  | "DARKEN"
  | "DIFFERENCE"
  | "DIVIDE"
  | "HUE"
  | "LIGHTEN"
  | "LUMINOSITY"
  | "MULTIPLY"
  | "NORMAL"
  | "OVERLAY"
  | "SATURATION"
  | "SCREEN"
  | "SUBTRACT";

/** A generic layer. */
export interface ILayer {
  /** The type of layer. */
  kind: string;
  /** `true` for layers that hold annotation information. */
  isAnnotation: boolean;
  /**
   * Indicates if this layer hold information in at least 3 spatial
   * dimensions.
   */
  is3DLayer: boolean;

  /** The layer's UUID. */
  id: string;
  /**
   * The layer's (user-defined) display name.
   * If none is set manually, the name of the layer's content (if any) will be
   * used, e.g., the ImageLayer's image name.
   */
  title?: string;
  /**
   * The parent layer of this layer.
   * Typically, this is the group the layer is contained in.
   * If none is set, the layer is assumed to be directly contained in the
   * document.
   */
  parent?: ILayer;

  /**
   * The family of this layer.
   * This groups layers that are related to each other, e.g., a segmentation file.
   * In conrast to the parent, the family itself is not a layer.
   */
  family?: ILayerFamily;

  /**
   * The blend mode used to combine this layer on top of the ones below.
   * Defaults to `"NORMAL"`.
   */
  blendMode?: BlendMode;
  /**
   * The color used to render layers without intrinsic color information,
   * provided as a theme key or CSS color string.
   * This is also used to color the layer icon in the layer menu.
   * If none is set, a default is chosen by the theme.
   */
  color?: string;
  /** Indicates if the layer should be rendered. */
  isVisible: boolean;
  /** The layer's opacity, (typically) ranged [0, 1]. */
  opacity: number;

  /** The layer's transform matrix used to position it during rendering. */
  transformation?: Matrix4;
  /** The layer's metadata ID. */
  metadata?: BackendMetadata;

  /**
   * Returns all slice markers, aggregated for the layer and given view type.
   */
  getSliceMarkers(viewType: ViewType): MarkerConfig[];

  /** Sets the layer's title. */
  setTitle(value?: string): void;

  setMetadata(value?: BackendMetadata): void;

  /** Sets this layer's parent layer, typically the group it is contained in. */
  setParent(idOrLayer?: string | ILayer): void;

  setFamily(id: string | undefined): void;

  getFamilyLayers(): ILayer[];

  setIsAnnotation(value?: boolean): void;

  setBlendMode(blendMode?: BlendMode): void;
  setColor(value?: string): void;
  tryToggleIsVisible(): void;
  setIsVisible(value?: boolean): void;
  setOpacity(value?: number): void;
  resetSettings(): void;

  /**
   * Deletes this layer from the document it is contained in and any potential
   * parents.
   * */
  delete(): void;

  toFile(): Promise<File | undefined>;
}

/**
 * A layer that holds dense pixel/voxel data.
 * It is typically used for, e.g., MRI scans and segmentation annotations.
 */
export interface IImageLayer extends ILayer {
  kind: "image";

  image: Image;

  /**
   * Local brightness adjustment of the layer.
   * `1` is the original brightness.
   */
  brightness: number;
  /**
   * Local contrast adjustment of the layer.
   * `1` is the original contrast.
   */
  contrast: number;

  densityHistogram?: Histogram;
  gradientHistogram?: Histogram;

  volume: number | null;
  area: { slice: number; viewType: ViewType; area: number } | null;

  /**
   * Triggers the slice markers of this layer to be recomputed.
   *
   * If a view type and slice number are given, only the marker state for this
   * slice will be updated. To additionally filter out unnecessary updates for
   * this slice, `isDeleteOperation` can be passed. It prohibits updating the
   * marker for an empty slice when `true` and that of a non-empty slice when
   * `false`.
   */
  recomputeSliceMarkers(
    viewType?: ViewType,
    slice?: number,
    isDeleteOperation?: boolean,
  ): Promise<void>;
  /**
   * Deletes all slice markers of this layer.
   *
   * If a view type and slice number are given, only the marker state for this
   * slice will be cleared.
   */
  clearSliceMarkers(viewType?: ViewType, slice?: number): Promise<void>;

  getVoxel(voxel: Voxel): Vector;

  getSlice(viewType: ViewType, slice: number): Uint8Array;
  setSlice(viewType: ViewType, slice: number, sliceData?: Uint8Array): void;

  computeVolume(): Promise<void>;
  computeArea(viewType: ViewType, slice: number): Promise<void>;

  setGradientHistogram(histogram?: Histogram): void;

  copy(): IImageLayer;
}

/** A group of layers. */
export interface ILayerGroup extends ILayer {
  kind: "group";

  /** All layers in the group. */
  layers: ILayer[];

  /** Adds a layer to the group. */
  addLayer(idOrlayer: string | ILayer): void;

  /** Removes a layer from the document (but keeps it in the document). */
  removeLayer(idOrLayer: string | ILayer): void;
}

export interface ILayerFamily {
  id: string;
  /** The family's display name. */
  title: string;
  /** The family's meta data. Usually the object from the DB */
  metadata?: BackendMetadata;
  /** All layers in the family. */
  layers: ILayer[];
  /** Returns `true` if the family has changes. */
  hasChanges: boolean;
  /** Adds a layer to the family. */
  addLayer(id: string): void;
  /** Removes a layer from the family (but keeps it in the document). */
  removeLayer(id: string): void;
  /** set verified if fam */
  trySetIsVerified(value: boolean): void;
}
