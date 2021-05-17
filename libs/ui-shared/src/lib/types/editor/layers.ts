import type { Image, ViewType, Voxel, VoxelWithValue } from "@visian/utils";
import type { Matrix4 } from "three";

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

  /** The layer's UUID. */
  id: string;
  /**
   * The layer's title.
   * A user-defined display name.
   */
  title: string;

  /**
   * The blend mode used to combine this layer on top of the ones below.
   * Defaults to `"NORMAL"`.
   */
  blendMode?: BlendMode;
  /**
   * The color used to render layers without intrinsic color information.
   * This is also used to color the layer icon in the layer menu.
   */
  color?: string;
  /** Indicates if the layer should be rendered. */
  isVisible: boolean;
  /** The layer's opacity, (typically) ranged [0, 1]. */
  opacity: number;

  /** The layer's transform matrix used to position it during rendering. */
  transformation?: Matrix4;
}

/**
 * A layer that holds dense pixel/voxel data.
 * It is typically used for, e.g., MRI scans and segmentation annotations.
 */
export interface IImageLayer extends ILayer, Image {
  kind: "image";

  /**
   * Local contrast adjustment of the layer.
   * `1` is the original contrast.
   */
  contrast: number;
  /**
   * Local brightness adjustment of the layer.
   * `1` is the original brightness.
   */
  brightness: number;

  getVoxel(voxel: Voxel): number;
  setVoxel(voxel: Voxel, value: number): number;
  setVoxels(voxels: VoxelWithValue[]): void;

  getSlice(viewType: ViewType, slice: number): Uint8Array;
  setSlice(viewType: ViewType, slice: number, sliceData?: Uint8Array): void;

  getAtlas(): Uint8Array;
  setAtlas(value: Uint8Array): void;
}

/** A group of layers. */
export interface ILayerGroup extends ILayer {
  kind: "group";

  /** All layers in the group. */
  subLayers: ILayer[];
}
