import type * as THREE from "three";

import type { Theme } from "../../theme";
import type { ISliceRenderer } from "../rendering";
import type { IDocument } from "./document";

/** The state of VISIAN's annotation editor. */
export interface IEditor {
  /** The document the user is currently working on. */
  activeDocument?: IDocument;

  /** The slice renderer. */
  sliceRenderer?: ISliceRenderer;
  renderers?: THREE.WebGLRenderer[];

  /** Proxy for the root store refs. */
  refs: { [name: string]: React.RefObject<HTMLElement> };

  /** Proxy for the root store theme. */
  theme: Theme;

  setSliceRenderer(sliceRenderer: ISliceRenderer): void;
}
