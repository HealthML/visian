import { ScreenAlignedQuad } from "@visian/rendering";
import { IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";

import { TextureAtlas } from "../../../texture-atlas";
import { IDisposable } from "../../../types";
import VolumeRenderer from "../../volume-renderer";
import { generateHistogram } from "../histogram";
import { SharedUniforms } from "../shared-uniforms";
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
    sharedUniforms: SharedUniforms,
  ) {
    this.firstDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.secondDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.outputDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);

    this.gradientMaterial = new GradientMaterial(
      this.firstDerivativeRenderTarget.texture,
      this.secondDerivativeRenderTarget.texture,
      sharedUniforms,
    );

    this.screenAlignedQuad = new ScreenAlignedQuad(this.gradientMaterial);

    this.reactionDisposers.push(
      reaction(
        () => volumeRenderer.model.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

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

          this.updateFirstDerivative();
          this.updateSecondDerivative();
          this.updateOutputDerivative();
        },
      ),
      reaction(
        () => volumeRenderer.model.cameraPosition,
        () => {
          if (
            this.volumeRenderer.model.transferFunction.updateNormalsOnCameraMove
          ) {
            this.updateOutputDerivative();
          }
        },
      ),
      reaction(
        () => [
          volumeRenderer.model.focus,
          volumeRenderer.model.useFocusVolume,
          volumeRenderer.model.focusColor,
          volumeRenderer.model.imageOpacity,
          volumeRenderer.model.contextOpacity,
          volumeRenderer.model.rangeLimits,
          volumeRenderer.model.cutAwayConeAngle,
          volumeRenderer.model.cutAwayConeDirection.toArray(),
          volumeRenderer.model.customTFTexture,
          volumeRenderer.model.transferFunction.type,
        ],
        this.updateOutputDerivative,
      ),
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
      this.volumeRenderer.model.lightingMode.needsNormals &&
      this.outputDerivativeDirty
    ) {
      this.renderOutputDerivative();
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

    this.renderer.setRenderTarget(this.firstDerivativeRenderTarget);

    const volumeTexture = this.textureAtlas.getTexture();
    const { magFilter } = volumeTexture;
    volumeTexture.magFilter = THREE.NearestFilter;
    volumeTexture.needsUpdate = true;

    this.screenAlignedQuad.renderWith(this.renderer);

    volumeTexture.magFilter = magFilter;
    volumeTexture.needsUpdate = true;

    this.renderer.setRenderTarget(null);

    this.firstDerivativeDirty = false;
    const buffer = new Uint8Array(
      this.firstDerivativeRenderTarget.width *
        this.firstDerivativeRenderTarget.height *
        4,
    );
    this.renderer.readRenderTargetPixels(
      this.firstDerivativeRenderTarget,
      0,
      0,
      this.firstDerivativeRenderTarget.width,
      this.firstDerivativeRenderTarget.height,
      buffer,
    );

    const gradientMagnitudes = [];
    const workingVector = new THREE.Vector3();
    for (let i = 0; i < buffer.length; i += 4) {
      workingVector.set(buffer[i], buffer[i + 1], buffer[i + 2]);
      gradientMagnitudes.push(workingVector.length());
    }

    this.volumeRenderer.model.setGradientHistogram(
      generateHistogram(gradientMagnitudes),
    );

    this.volumeRenderer.lazyRender();
  }

  private updateSecondDerivative() {
    this.secondDerivativeDirty = true;
  }

  private renderSecondDerivative() {
    this.gradientMaterial.uniforms.uInputDimensions.value = 3;
    this.gradientMaterial.setGradientMode(GradientMode.Second);

    this.renderer.setRenderTarget(this.secondDerivativeRenderTarget);

    this.screenAlignedQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(null);

    this.secondDerivativeDirty = false;

    this.volumeRenderer.lazyRender();
  }

  private updateOutputDerivative = () => {
    this.outputDerivativeDirty = true;
  };

  private renderOutputDerivative() {
    if (!this.textureAtlas) return;

    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.Output);

    this.renderer.setRenderTarget(this.outputDerivativeRenderTarget);

    const volumeTexture = this.textureAtlas.getTexture();
    const { magFilter } = volumeTexture;
    volumeTexture.magFilter = THREE.NearestFilter;
    volumeTexture.needsUpdate = true;

    this.screenAlignedQuad.renderWith(this.renderer);

    volumeTexture.magFilter = magFilter;
    volumeTexture.needsUpdate = true;

    this.renderer.setRenderTarget(null);

    this.outputDerivativeDirty = false;

    this.volumeRenderer.lazyRender();
  }
}

export default GradientComputer;
