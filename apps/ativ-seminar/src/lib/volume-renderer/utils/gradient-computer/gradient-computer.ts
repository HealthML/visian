import * as THREE from "three";

import ScreenAlignedQuad from "../screen-aligned-quad";
import { TextureAtlas } from "../texture-atlas";
import gradientFragmentShader from "./shader/gradient.frag.glsl";
import gradientVertexShader from "./shader/gradient.vert.glsl";

export class GradientComputer {
  private gradientMaterial: THREE.ShaderMaterial;
  private screenAlignedQuad: ScreenAlignedQuad;

  private firstDerivativeRendererTarget?: THREE.WebGLRenderTarget;
  private secondDerivativeRendererTarget?: THREE.WebGLRenderTarget;

  constructor(
    private textureAtlas: TextureAtlas,
    private renderer: THREE.WebGLRenderer,
  ) {
    this.gradientMaterial = new THREE.ShaderMaterial({
      fragmentShader: gradientFragmentShader,
      vertexShader: gradientVertexShader,
      uniforms: {
        uTextureAtlas: { value: textureAtlas.getTexture() },
        uVoxelSpacing: { value: textureAtlas.voxelSpacing },
        uVoxelCount: { value: textureAtlas.voxelCount },
        uAtlasGrid: { value: textureAtlas.atlasGrid },
      },
    });
    this.screenAlignedQuad = new ScreenAlignedQuad(this.gradientMaterial);
  }

  /** Returns the gradient of the texture atlas. */
  public getFirstDerivative() {
    if (!this.firstDerivativeRendererTarget) {
      this.firstDerivativeRendererTarget = new THREE.WebGLRenderTarget(
        this.textureAtlas.atlasSize.x,
        this.textureAtlas.atlasSize.y,
      );

      this.renderer.setRenderTarget(this.firstDerivativeRendererTarget);

      const magFilter = this.gradientMaterial.uniforms.uTextureAtlas.value
        .magFilter;
      this.gradientMaterial.uniforms.uTextureAtlas.value.magFilter =
        THREE.NearestFilter;
      this.gradientMaterial.uniforms.uTextureAtlas.value.needsUpdate = true;

      this.screenAlignedQuad.renderWith(this.renderer);

      this.gradientMaterial.uniforms.uTextureAtlas.value.magFilter = magFilter;
      this.gradientMaterial.uniforms.uTextureAtlas.value.needsUpdate = true;

      // Reset the render target
      this.renderer.setRenderTarget(null);
    }

    return this.firstDerivativeRendererTarget.texture;
  }

  /**
   * Returns the gradient of the gradient of the texture atlas.
   *
   * @todo How to combine all gradient dimensions?
   */
  public getSecondDerivative() {
    if (!this.secondDerivativeRendererTarget) {
      this.secondDerivativeRendererTarget = new THREE.WebGLRenderTarget(
        this.textureAtlas.atlasSize.x,
        this.textureAtlas.atlasSize.y,
      );

      this.gradientMaterial.uniforms.uTextureAtlas.value = this.getFirstDerivative();
      this.gradientMaterial.needsUpdate = true;

      this.renderer.setRenderTarget(this.secondDerivativeRendererTarget);

      this.screenAlignedQuad.renderWith(this.renderer);

      // Reset the render target
      this.renderer.setRenderTarget(null);
    }

    return this.secondDerivativeRendererTarget.texture;
  }
}

export default GradientComputer;
