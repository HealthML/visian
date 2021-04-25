import { ScreenAlignedQuad } from "@visian/utils";
import * as THREE from "three";

import { Voxels } from "./voxels";

export const copyToRenderTarget = (
  source: ScreenAlignedQuad,
  target: THREE.WebGLRenderTarget,
  renderer: THREE.WebGLRenderer,
) => {
  const previousRenderTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(target);

  const previousAutoClear = renderer.autoClear;
  renderer.autoClear = true;

  source.renderWith(renderer);

  renderer.autoClear = previousAutoClear;
  renderer.setRenderTarget(previousRenderTarget);
};

export const renderVoxels = (
  voxels: Voxels,
  target: THREE.WebGLRenderTarget,
  renderer: THREE.WebGLRenderer,
) => {
  const previousRenderTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(target);

  const previousAutoClear = renderer.autoClear;
  renderer.autoClear = false;

  renderer.render(voxels, voxels.camera);

  renderer.autoClear = previousAutoClear;
  renderer.setRenderTarget(previousRenderTarget);
};
