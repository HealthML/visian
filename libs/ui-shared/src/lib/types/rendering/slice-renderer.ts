import type { IDisposable, Pixel, ViewType } from "@visian/utils";
import type * as THREE from "three";

import type { IOutline } from "./outline";

export interface ISliceRenderer extends IDisposable {
  renderers: THREE.WebGLRenderer[];

  animate: () => void;

  lazyRender(): void;
  eagerRender(): void;
  resize(): void;
  getOutline(viewType?: ViewType): IOutline;
  showBrushCursorPreview(viewType?: ViewType): void;
  getVirtualUVs(screenPosition: Pixel, viewType?: ViewType): Pixel;
  alignBrushCursor(uv: Pixel, viewType?: ViewType, preview?: boolean): void;

  /** Converts a WebGL position to a screen space one. */
  getMainViewScreenPosition(webGLPosition: Pixel): Pixel;
  /** Converts a screen space position to a WebGL one. */
  getWebGLPosition(screenPosition: Pixel, viewType?: ViewType): Pixel;

  resetCrosshairOffset(): void;
}
