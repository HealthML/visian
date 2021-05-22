import { ViewType } from "@visian/utils";
import type * as THREE from "three";
import { IOutline } from "./outline";
import { IRenderLoopSubscriber } from "./render-loop-subscriber";

export interface ISliceRenderer {
  renderers: THREE.WebGLRenderer[];

  lazyRender(): void;
  getOutline(viewType?: ViewType): IOutline;
  showBrushCursorPreview(viewType?: ViewType): void;
  subscribeToRenderLoop(subscriber: IRenderLoopSubscriber): void;
  unsubscribeFromRenderLoop(subscriber: IRenderLoopSubscriber): void;
}
