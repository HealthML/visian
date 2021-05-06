import { ScreenAlignedQuad } from "@visian/utils";
import * as THREE from "three";

import { Voxels } from "./voxels";

export const copyToRenderTarget = (
  source: ScreenAlignedQuad,
  target: THREE.WebGLRenderTarget,
  renderer: THREE.WebGLRenderer,
) => {
  renderer.setRenderTarget(target);

  source.renderWith(renderer);

  renderer.setRenderTarget(null);
};

export const renderVoxels = (
  voxels: Voxels,
  target: THREE.WebGLRenderTarget,
  renderer: THREE.WebGLRenderer,
) => {
  renderer.setRenderTarget(target);
  renderer.autoClear = false;

  renderer.render(voxels, voxels.camera);

  renderer.autoClear = true;
  renderer.setRenderTarget(null);
};
