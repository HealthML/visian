import type * as THREE from "three";

import type { Theme } from "../../theme";
import type { ISliceRenderer, IVolumeRenderer } from "../rendering";
import type { IDocument } from "./document";

/** The state of VISIAN's annotation editor. */
export interface IEditor {
  /** The document the user is currently working on. */
  activeDocument?: IDocument;

  /** The slice renderer. */
  sliceRenderer?: ISliceRenderer;
  /** The volume renderer */
  volumeRenderer?: IVolumeRenderer;
  /**
   * The 3 webGL renderers used for the 3 canvases.
   * [0]: The main canvas's renderer.
   * [1]: The upper side view canvas's renderer.
   * [2]: The lower side view canvas's renderer.
   */
  renderers: [THREE.WebGLRenderer, THREE.WebGLRenderer, THREE.WebGLRenderer];

  /** Proxy for the root store refs. */
  refs: { [name: string]: React.RefObject<HTMLElement> };

  /** Proxy for the root store theme. */
  theme: Theme;
}
