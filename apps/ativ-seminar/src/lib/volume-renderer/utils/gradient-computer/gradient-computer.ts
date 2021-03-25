import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";

import { IDisposable } from "../../../types";
import VolumeRenderer from "../../volume-renderer";
import ScreenAlignedQuad from "../screen-aligned-quad";
import { TextureAtlas } from "../texture-atlas";
import { GradientMaterial, GradientMode } from "./gradient-material";

export class GradientComputer implements IDisposable {
  private gradientMaterial: GradientMaterial;
  private screenAlignedQuad: ScreenAlignedQuad;

  private firstDerivativeRenderTarget: THREE.WebGLRenderTarget;
  private secondDerivativeRenderTarget: THREE.WebGLRenderTarget;
  private outputDerivativeRenderTarget: THREE.WebGLRenderTarget;

  private firstDerivativeDirty = true;
  private secondDerivativeDirty = true;
  private outputDerivativeDirty = true;

  private reactionDisposers: IReactionDisposer[] = [];

  private textureAtlas?: TextureAtlas;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private volumeRenderer: VolumeRenderer,
  ) {
    this.firstDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.secondDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.outputDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);

    this.gradientMaterial = new GradientMaterial(
      this.firstDerivativeRenderTarget.texture,
      this.secondDerivativeRenderTarget.texture,
    );

    this.screenAlignedQuad = new ScreenAlignedQuad(this.gradientMaterial);

    this.reactionDisposers.push(
      autorun(() => {
        this.gradientMaterial.uniforms.uTransferFunction.value =
          volumeRenderer.transferFunction.type;

        this.updateOutputDerivative();
      }),
      autorun(() => {
        this.gradientMaterial.uniforms.uContextOpacity.value =
          volumeRenderer.contextOpacity;

        this.updateOutputDerivative();
      }),
      autorun(() => {
        this.gradientMaterial.uniforms.uLimitLow.value =
          volumeRenderer.rangeLimits[0];
        this.gradientMaterial.uniforms.uLimitHigh.value =
          volumeRenderer.rangeLimits[1];

        this.updateOutputDerivative();
      }),
      autorun(() => {
        this.gradientMaterial.uniforms.uConeAngle.value =
          volumeRenderer.cutAwayConeAngle;

        this.updateOutputDerivative();
      }),
    );
  }

  public dispose() {
    this.gradientMaterial.dispose();
    this.reactionDisposers.forEach((disposer) => disposer());
  }

  public tick() {
    if (this.firstDerivativeDirty) {
      this.renderFirstDerivative();
    }
    if (this.secondDerivativeDirty) {
      this.renderSecondDerivative();
    }
    if (
      this.volumeRenderer.lightingMode.needsNormals &&
      this.outputDerivativeDirty
    ) {
      this.renderOutputDerivative();
    }
  }

  public setAtlas(atlas: TextureAtlas) {
    this.firstDerivativeRenderTarget.setSize(
      atlas.atlasSize.x,
      atlas.atlasSize.y,
    );
    this.secondDerivativeRenderTarget.setSize(
      atlas.atlasSize.x,
      atlas.atlasSize.y,
    );
    this.outputDerivativeRenderTarget.setSize(
      atlas.atlasSize.x,
      atlas.atlasSize.y,
    );

    this.textureAtlas = atlas;

    this.gradientMaterial.setAtlas(atlas);

    this.updateFirstDerivative();
    this.updateSecondDerivative();
    this.updateOutputDerivative();
  }

  public setFocusAtlas(atlas?: TextureAtlas) {
    this.gradientMaterial.setFocusAtlas(atlas);

    this.updateOutputDerivative();
  }

  public setCameraPosition(position: THREE.Vector3) {
    this.gradientMaterial.setCameraPosition(position);

    if (this.volumeRenderer.transferFunction.updateNormalsOnCameraMove) {
      this.updateOutputDerivative();
    }
  }

  public getFirstDerivative() {
    return this.firstDerivativeRenderTarget.texture;
  }

  public getSecondDerivative() {
    return this.secondDerivativeRenderTarget.texture;
  }

  public getOutputDerivative() {
    return this.outputDerivativeRenderTarget.texture;
  }

  private updateFirstDerivative() {
    this.firstDerivativeDirty = true;
  }

  private renderFirstDerivative() {
    if (!this.textureAtlas) return;

    // TODO: Set uInputDimensions depending on image.
    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.First);

    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.firstDerivativeRenderTarget);

    const volumeTexture = this.textureAtlas.getTexture();
    const magFilter = volumeTexture.magFilter;
    volumeTexture.magFilter = THREE.NearestFilter;
    volumeTexture.needsUpdate = true;

    this.screenAlignedQuad.renderWith(this.renderer);

    volumeTexture.magFilter = magFilter;
    volumeTexture.needsUpdate = true;

    this.renderer.setRenderTarget(previousRenderTarget);

    this.firstDerivativeDirty = false;

    this.volumeRenderer.lazyRender();
  }

  private updateSecondDerivative() {
    this.secondDerivativeDirty = true;
  }

  private renderSecondDerivative() {
    this.gradientMaterial.uniforms.uInputDimensions.value = 3;
    this.gradientMaterial.setGradientMode(GradientMode.Second);

    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.secondDerivativeRenderTarget);

    this.screenAlignedQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(previousRenderTarget);

    this.secondDerivativeDirty = false;

    this.volumeRenderer.lazyRender();
  }

  private updateOutputDerivative() {
    this.outputDerivativeDirty = true;
  }

  private renderOutputDerivative() {
    if (!this.textureAtlas) return;

    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.Output);

    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.outputDerivativeRenderTarget);

    const volumeTexture = this.textureAtlas.getTexture();
    const magFilter = volumeTexture.magFilter;
    volumeTexture.magFilter = THREE.NearestFilter;
    volumeTexture.needsUpdate = true;

    this.screenAlignedQuad.renderWith(this.renderer);

    volumeTexture.magFilter = magFilter;
    volumeTexture.needsUpdate = true;

    this.renderer.setRenderTarget(previousRenderTarget);

    this.outputDerivativeDirty = false;

    this.volumeRenderer.lazyRender();
  }
}

export default GradientComputer;
