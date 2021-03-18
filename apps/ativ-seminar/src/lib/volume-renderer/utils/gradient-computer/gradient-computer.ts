import * as THREE from "three";

import { TransferFunction } from "../../types";
import ScreenAlignedQuad from "../screen-aligned-quad";
import { TextureAtlas } from "../texture-atlas";
import { GradientMaterial, GradientMode } from "./gradient-material";

export class GradientComputer {
  private gradientMaterial: GradientMaterial;
  private screenAlignedQuad: ScreenAlignedQuad;

  public firstDerivativeRenderTarget: THREE.WebGLRenderTarget;
  public secondDerivativeRenderTarget: THREE.WebGLRenderTarget;
  private outputDerivativeRenderTarget: THREE.WebGLRenderTarget;

  private firstDerivativeCached = false;
  private secondDerivativeCached = false;

  constructor(
    private textureAtlas: TextureAtlas,
    private renderer: THREE.WebGLRenderer,
  ) {
    this.firstDerivativeRenderTarget = new THREE.WebGLRenderTarget(
      this.textureAtlas.atlasSize.x,
      this.textureAtlas.atlasSize.y,
    );
    this.secondDerivativeRenderTarget = new THREE.WebGLRenderTarget(
      this.textureAtlas.atlasSize.x,
      this.textureAtlas.atlasSize.y,
    );
    this.outputDerivativeRenderTarget = new THREE.WebGLRenderTarget(
      this.textureAtlas.atlasSize.x,
      this.textureAtlas.atlasSize.y,
    );

    this.gradientMaterial = new GradientMaterial(
      textureAtlas,
      this.firstDerivativeRenderTarget.texture,
      this.secondDerivativeRenderTarget.texture,
    );

    this.screenAlignedQuad = new ScreenAlignedQuad(this.gradientMaterial);
  }

  public setFocus(atlas?: TextureAtlas) {
    this.gradientMaterial.setFocus(atlas);

    this.updateOutputDerivative();
  }

  public setCameraPosition(position: THREE.Vector3) {
    this.gradientMaterial.setCameraPosition(position);

    if (
      this.gradientMaterial.uniforms.uTransferFunction.value ===
      TransferFunction.FCCutaway
    ) {
      this.updateOutputDerivative();
    }
  }

  public setTransferFunction(transferFunction: TransferFunction) {
    this.gradientMaterial.setTransferFunction(transferFunction);

    this.updateOutputDerivative();
  }

  public setCutAwayConeAngle(radians: number) {
    this.gradientMaterial.setCutAwayConeAngle(radians);

    this.updateOutputDerivative();
  }

  /** Returns the gradient of the texture atlas. */
  public getFirstDerivative() {
    if (!this.firstDerivativeCached) {
      // TODO: Set uInputDimensions depending on image.
      this.gradientMaterial.uniforms.uInputDimensions.value = 1;
      this.gradientMaterial.setGradientMode(GradientMode.First);

      this.renderer.setRenderTarget(this.firstDerivativeRenderTarget);

      const volumeTexture = this.textureAtlas.getTexture();
      const magFilter = volumeTexture.magFilter;
      volumeTexture.magFilter = THREE.NearestFilter;
      volumeTexture.needsUpdate = true;

      this.screenAlignedQuad.renderWith(this.renderer);

      volumeTexture.magFilter = magFilter;
      volumeTexture.needsUpdate = true;

      // Reset the render target
      this.renderer.setRenderTarget(null);

      this.firstDerivativeCached = true;
    }

    return this.firstDerivativeRenderTarget.texture;
  }

  /**
   * Returns the gradient of the gradient of the texture atlas.
   *
   * @todo How to combine all gradient dimensions?
   */
  public getSecondDerivative() {
    if (!this.secondDerivativeCached) {
      this.gradientMaterial.uniforms.uInputDimensions.value = 3;
      this.gradientMaterial.setGradientMode(GradientMode.Second);

      this.renderer.setRenderTarget(this.secondDerivativeRenderTarget);

      this.screenAlignedQuad.renderWith(this.renderer);

      // Reset the render target
      this.renderer.setRenderTarget(null);

      this.secondDerivativeCached = true;
    }

    return this.secondDerivativeRenderTarget.texture;
  }

  public getOutputDerivative() {
    return this.outputDerivativeRenderTarget.texture;
  }

  private updateOutputDerivative() {
    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.Output);

    this.renderer.setRenderTarget(this.outputDerivativeRenderTarget);

    const volumeTexture = this.textureAtlas.getTexture();
    const magFilter = volumeTexture.magFilter;
    volumeTexture.magFilter = THREE.NearestFilter;
    volumeTexture.needsUpdate = true;

    this.screenAlignedQuad.renderWith(this.renderer);

    volumeTexture.magFilter = magFilter;
    volumeTexture.needsUpdate = true;

    // Reset the render target
    this.renderer.setRenderTarget(null);
  }
}

export default GradientComputer;
