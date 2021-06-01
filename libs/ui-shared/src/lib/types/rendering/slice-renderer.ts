import type { IDisposable, Pixel, ViewType } from "@visian/utils";
import type * as THREE from "three";

import type { IOutline } from "./outline";
import type { IRenderLoopSubscriber } from "./render-loop-subscriber";

export interface ISliceRenderer extends IDisposable {
  renderers: THREE.WebGLRenderer[];

  lazyRender(): void;
  eagerRender(): void;
  getOutline(viewType?: ViewType): IOutline;
  showBrushCursorPreview(viewType?: ViewType): void;
  subscribeToRenderLoop(subscriber: IRenderLoopSubscriber): void;
  unsubscribeFromRenderLoop(subscriber: IRenderLoopSubscriber): void;
  getVirtualUVs(screenPosition: Pixel, viewType?: ViewType): Pixel;
  alignBrushCursor(uv: Pixel, viewType?: ViewType, preview?: boolean): void;

  /** Converts a WebGL position to a screen space one. */
  getMainViewScreenPosition(webGLPosition: Pixel): Pixel;
  /** Converts a screen space position to a WebGL one. */
  getWebGLPosition(screenPosition: Pixel, viewType?: ViewType): Pixel;
}
