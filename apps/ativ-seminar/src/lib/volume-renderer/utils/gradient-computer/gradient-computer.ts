import * as THREE from "three";

import { TextureAtlas } from "../texture-atlas";
import gradientFragmentShader from "./shader/gradient.frag.glsl";
import gradientVertexShader from "./shader/gradient.vert.glsl";

export class GradientComputer {
  private camera: THREE.OrthographicCamera;
  private scene = new THREE.Scene();
  private quad: THREE.Mesh;
  private gradientMaterial: THREE.ShaderMaterial;

  private firstDerivativeRendererTarget?: THREE.WebGLRenderTarget;
  private secondDerivativeRendererTarget?: THREE.WebGLRenderTarget;

  constructor(
    private textureAtlas: TextureAtlas,
    private renderer: THREE.WebGLRenderer,
  ) {
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 100);
    this.camera.position.z = 10;

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

    const quadGeometry = new THREE.PlaneGeometry(1, 1);
    this.quad = new THREE.Mesh(quadGeometry, this.gradientMaterial);
    this.scene.add(this.quad);
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

      this.renderer.render(this.scene, this.camera);

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

      this.renderer.render(this.scene, this.camera);

      // Reset the render target
      this.renderer.setRenderTarget(null);
    }

    return this.secondDerivativeRendererTarget.texture;
  }
}

export default GradientComputer;
