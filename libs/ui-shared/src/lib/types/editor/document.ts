import type * as THREE from "three";

import type { ISliceRenderer } from "../rendering";
import type { IHistory } from "./history";
import type { ILayer } from "./layers";
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

  /** The layer that is currently selected for editing. */
  activeLayer?: Reference<ILayer>;
  /**
   * The document's layer stack.
   * This contains all top-level layers (not contained in some group), sorted
   * top-to-bottom.
   */
  layers: ILayer[];
  has3DLayers: boolean;

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
  renderers?: Reference<THREE.WebGLRenderer[]>;

  /** Reads a layer based on its id. */
  getLayer(id: string): ILayer | undefined;

  /** Adds a layer to the document. */
  addLayer(layer: ILayer): void;

  /** Deletes a layer from the document. */
  deleteLayer(idOrLayer: string | ILayer): void;

  /** Persists the document immediately. */
  save(): Promise<void>;

  /**
   * Requests the document to be saved at some point.
   * This may be delayed until the next auto-save.
   */
  requestSave(): Promise<void>;
}
