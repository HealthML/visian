import { ScreenAlignedQuad } from "@visian/rendering";
import * as THREE from "three";

import { Texture3DMaterial } from "./types";

export class Texture3DRenderer {
  private target?: THREE.WebGLRenderTarget;
  private material?: Texture3DMaterial;

  private quad = new ScreenAlignedQuad();

  public setTarget(target?: THREE.WebGLRenderTarget) {
    this.target = target;
    this.updateMaterialDimensions();
  }

  public setMaterial(material?: Texture3DMaterial) {
    this.material = material;
    this.updateMaterialDimensions();
  }

  private updateMaterialDimensions() {
    if (this.target && this.material) {
      const { width, height, depth } = this.target;
      this.material.uniforms.uWidth.value = width;
      this.material.uniforms.uHeight.value = height;
      this.material.uniforms.uDepth.value = depth;
    }
  }

  public render(
    renderer: THREE.WebGLRenderer,
    interval: [number, number] = [0, this.target?.depth ?? 0],
    autoClear = true,
  ) {
    const [start, end] = interval;
    if (end <= start || !this.target || !this.material) return;

    this.quad.material = this.material;

    renderer.autoClear = autoClear;
    for (let slice = start; slice < Math.min(end, this.target.depth); slice++) {
      (this.quad.material as Texture3DMaterial).uniforms.uSlice.value = slice;
      renderer.setRenderTarget(this.target, slice);
      this.quad.renderWith(renderer);
    }
    renderer.setRenderTarget(null);
    renderer.autoClear = true;
  }
}
