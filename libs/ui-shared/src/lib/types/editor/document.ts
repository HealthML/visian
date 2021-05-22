import type * as THREE from "three";
import type { IEditor } from "./editor";
import type { IHistory } from "./history";
import type { ILayer } from "./layers";
import type { ITools } from "./tools";
import type { Reference } from "./types";
import type { IViewport2D, IViewport3D, IViewSettings } from "./view-settings";
import { ISliceRenderer } from "../rendering";

// `label` is a display name for an attribute

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

  /** The editor this document is part of. */
  editor: IEditor;

  /** The layer that is currently selected for editing. */
  activeLayer?: Reference<ILayer>;
  /** The document's layer stack. */
  layers: ILayer[];

  /** The document's history.' */
  history: IHistory;

  viewSettings: IViewSettings;
  viewport2D: IViewport2D;
  viewport3D: IViewport3D;

  tools: ITools;

  sliceRenderer?: ISliceRenderer;
  renderers?: THREE.WebGLRenderer[];

  /** Reads a layer based on its id. */
  getLayer(id: string): ILayer | undefined;

  /** Adds a layer to the document. */
  addLayer(layer: ILayer): void;

  /** Deletes a layer from the document. */
  deleteLayer(idOrLayer: string | ILayer): void;

  setSliceRenderer(sliceRenderer: ISliceRenderer): void;
}
