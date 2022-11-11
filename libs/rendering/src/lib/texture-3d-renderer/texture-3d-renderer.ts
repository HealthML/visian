import { IDisposable } from "@visian/utils";
import * as THREE from "three";

import { ScreenAlignedQuad } from "../screen-aligned-quad";
import { Texture3DMaterial } from "./texture-3d-material";

export class Texture3DRenderer implements IDisposable {
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
      this.material.setSize({ x: width, y: height, z: depth });
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
    for (
      let slice = Math.max(0, start);
      slice < Math.min(end, this.target.depth);
      slice++
    ) {
      (this.quad.material as Texture3DMaterial).setSlice(slice);
      renderer.setRenderTarget(this.target, slice);
      this.quad.renderWith(renderer);
    }
    renderer.setRenderTarget(null);
    renderer.autoClear = true;
  }

  public clear(renderer: THREE.WebGLRenderer) {
    if (!this.target) return;
    for (let i = 0; i < this.target.depth; i++) {
      renderer.setRenderTarget(this.target, i);
      renderer.clear();
    }
    renderer.setRenderTarget(null);
  }

  public dispose() {
    this.quad.dispose();
  }
}
