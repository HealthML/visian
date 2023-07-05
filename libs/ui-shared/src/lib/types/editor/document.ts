import type * as THREE from "three";

import { ILayerFamily, MeasurementType, PerformanceMode } from ".";
import { Theme } from "../../theme";
import type { ErrorNotification } from "../error-notification";
import type { ISliceRenderer, IVolumeRenderer } from "../rendering";
import { ITrackingData, TrackingLog } from "../tracking";
import type { IClipboard } from "./clipboard";
import type { IHistory } from "./history";
import type { IImageLayer, ILayer } from "./layers";
import type { IMarkers } from "./markers";
import type { ITools } from "./tools";
import type { Reference } from "./types";
import type { IViewport2D, IViewport3D, IViewSettings } from "./view-settings";

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
   * All the document's layers sorted by their rendering order.
   * top-to-bottom
   */
  layers: ILayer[];
  /**
   * The document's layer and layer Family stack.
   * This contains all top-level layers (not contained in some family) and all layerFamilies, sorted
   * top-to-bottom
   */
  renderingOrder: (ILayer | ILayerFamily)[];
  /**
   * The document's layer and layer Family stack.
   * This contains all layers and all layerFamilies, sorted by their renderingOrder
   * layerFamilies are followed by the layers within that family
   * top-to-bottom
   */
  flatRenderingOrder: (ILayer | ILayerFamily)[];

  /** `true` if the document holds three-dimensional layers. */
  has3DLayers: boolean;
  /** The layer that is currently selected for editing. */
  activeLayer?: Reference<ILayer>;
  /** The maximum amount of layers that can be rendered. */
  maxLayers: number;
  /** The maximum amount of layers that can be rendered in 3d. */
  maxLayers3d: number;

  /** The layer that is currently selected for displaying a measurement. */
  measurementDisplayLayer?: Reference<IImageLayer>;
  /** The type of measurement that should be displayed. */
  measurementType: MeasurementType;

  /** A view on the document's `layers`, containing only its image layers. */
  imageLayers: Reference<IImageLayer>[];
  /**
   * The base image layer that serves as a reference for all other image
   * layers to be registered to it.
   */
  mainImageLayer?: Reference<IImageLayer>;

  /** The families of layers e.g. for grouping layers by file */
  layerFamilies: ILayerFamily[] | undefined;

  /** The document's history. */
  history: IHistory;

  /** The document's clipboard. */
  clipboard: IClipboard;

  viewSettings: IViewSettings;
  viewport2D: IViewport2D;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewport3D: IViewport3D<any>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: ITools<any>;

  markers: IMarkers;

  sliceRenderer?: Reference<ISliceRenderer>;
  volumeRenderer?: Reference<IVolumeRenderer>;
  renderer?: Reference<THREE.WebGLRenderer>;
  theme: Theme;
  performanceMode: PerformanceMode;

  /** Indicates wether the layer menu is open. */
  showLayerMenu: boolean;

  trackingData?: ITrackingData;

  useExclusiveSegmentations: boolean;

  setShowLayerMenu(value?: boolean): void;
  toggleLayerMenu(): void;

  /** Reads a layer based on its id. */
  getLayer(id: string): ILayer | undefined;

  getLayerFamily(id: string): ILayerFamily | undefined;

  /** Sets the active layer. */
  setActiveLayer(idOrLayer?: string | ILayer): void;

  /** Sets the layer that is currently selected for displaying a measurement. */
  setMeasurementDisplayLayer(idOrLayer?: string | IImageLayer): void;
  /** Sets the type of measurement that should be displayed. */
  setMeasurementType(measurementType: MeasurementType): void;

  /** Adds a layer to the document. */
  addLayer(layer: ILayer, idx?: number): void;

  /** Adds a layer family to the document. */
  addLayerFamily(layer: ILayerFamily): void;

  /** Deletes a layer from the document. */
  deleteLayer(idOrLayer: string | ILayer): void;

  /** Returns the first color that is not yet used to color any layer. */
  getFirstUnusedColor(): string;
  /** Returns the color to be used for, e.g., 3D region growing preview. */
  getAnnotationPreviewColor(): string;

  importTrackingLog(log: TrackingLog): void;

  /** Persists the document immediately. */
  save(): Promise<void>;

  /**
   * Requests the document to be saved at some point.
   * This may be delayed until the next auto-save.
   */
  requestSave(): Promise<void>;

  setUseExclusiveSegmentations(value: boolean): void;
  getExcludedSegmentations(layer: ILayer): IImageLayer[] | undefined;

  setError(error: ErrorNotification): void;
}
