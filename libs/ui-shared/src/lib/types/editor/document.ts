import type { IHistory } from "./history";
import type { ILayer } from "./layers";
import type { ITools } from "./tools";
import type { Reference } from "./types";
import type { IViewport2D, IViewport3D, IViewSettings } from "./view-settings";

// `label` is a display name for an attribute

/** A VISIAN document, consisting of up to multiple editable layers. */
export interface IDocument {
  /** The document's UUID. */
  id: string;

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

  /** Reads a layer based on its id. */
  getLayer(id: string): ILayer | undefined;
}
