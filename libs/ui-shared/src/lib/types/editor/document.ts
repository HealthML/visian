import type * as THREE from "three";

import type { ISliceRenderer, IVolumeRenderer } from "../rendering";
import type { IHistory } from "./history";
import type { IImageLayer, ILayer } from "./layers";
import type { ITools } from "./tools";
import type { Reference } from "./types";
import type { IViewport2D, IViewport3D, IViewSettings } from "./view-settings";
import type { IMarkers } from "./markers";

/** A VISIAN document, consisting of up to multiple editable layers. */
export interface IDocument {
  /** The document's UUID. */
  id: string;
  /**
   * The document's (user-defined) display name.
   * If none is set manually, the name of the lowest layer (if any) will be
   * used.
   */
  title?: string;

  /**
   * The document's layer stack.
   * This contains all top-level layers (not contained in some group), sorted
   * top-to-bottom.
   */
  layers: ILayer[];
  /** `true` if the document holds three-dimensional layers. */
  has3DLayers: boolean;
  /** The layer that is currently selected for editing. */
  activeLayer?: Reference<ILayer>;

  /** A view on the document's `layers`, containing only its image layers. */
  imageLayers: Reference<IImageLayer>[];
  /**
   * The base image layer that serves as a reference for all other image
   * layers to be registered to it.
   */
  baseImageLayer?: Reference<IImageLayer>;

  /** The document's history.' */
  history: IHistory;

  viewSettings: IViewSettings;
  viewport2D: IViewport2D;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewport3D: IViewport3D<any>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: ITools<any>;

  markers: IMarkers;

  sliceRenderer?: Reference<ISliceRenderer>;
  volumeRenderer?: Reference<IVolumeRenderer>;
  renderers?: Reference<THREE.WebGLRenderer[]>;

  /** Indicates wether the layer menu is open. */
  showLayerMenu: boolean;

  setShowLayerMenu(value?: boolean): void;
  toggleLayerMenu(): void;

  /** Reads a layer based on its id. */
  getLayer(id: string): ILayer | undefined;

  /** Sets the active layer. */
  setActiveLayer(idOrLayer?: string | ILayer): void;

  /** Adds a layer to the document. */
  addLayer(layer: ILayer): void;

  /** Deletes a layer from the document. */
  deleteLayer(idOrLayer: string | ILayer): void;

  /** Returns the first color that is not yet used to color any layer. */
  getFirstUnusedColor(): string;
  /** Returns the color to be used for 3D region growing preview. */
  getRegionGrowingPreviewColor(): string;

  /** Persists the document immediately. */
  save(): Promise<void>;

  /**
   * Requests the document to be saved at some point.
   * This may be delayed until the next auto-save.
   */
  requestSave(): Promise<void>;
}
