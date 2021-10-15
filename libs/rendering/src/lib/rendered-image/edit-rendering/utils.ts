import * as THREE from "three";
import { ScreenAlignedQuad } from "../../screen-aligned-quad";

export const copyToRenderTarget = (
  source: ScreenAlignedQuad,
  target: THREE.WebGLRenderTarget,
  renderer: THREE.WebGLRenderer,
) => {
  renderer.setRenderTarget(target);

  source.renderWith(renderer);

  renderer.setRenderTarget(null);
};
