import type * as THREE from "three";

import type { ColorMode, Theme } from "../../theme";
import type { ISliceRenderer, IVolumeRenderer } from "../rendering";
import type { IDocument } from "./document";
import { PerformanceMode } from "./types";

/** The state of VISIAN's annotation editor. */
export interface IEditor {
  /** Whether the editor is available. Currently only `false` if WebGL 2 is unavailable. */
  isAvailable: boolean;

  /** The document the user is currently working on. */
  activeDocument?: IDocument;

  /** The slice renderer. */
  sliceRenderer?: ISliceRenderer;
  /** The volume renderer */
  volumeRenderer?: IVolumeRenderer;
  /** The webGL renderer used for the canvas. */
  renderer: THREE.WebGLRenderer;

  /** Proxy for the root store refs. */
  refs: { [name: string]: React.RefObject<HTMLElement> };

  /** Proxy for the root store theme. */
  theme: Theme;

  /** Proxy for the root store color mode. */
  colorMode: ColorMode;

  /** The available graphics performance. */
  performanceMode: PerformanceMode;

  /** The URL to return to after the editor is closed. */
  returnUrl?: string;

  setReturnUrl(url?: string): void;
  setPerformanceMode(mode?: PerformanceMode): void;
}
