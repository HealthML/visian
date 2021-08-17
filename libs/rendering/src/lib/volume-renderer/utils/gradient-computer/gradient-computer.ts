import { IEditor } from "@visian/ui-shared";
import { IDisposable, Image } from "@visian/utils";
import { IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";

import { ScreenAlignedQuad } from "../../../screen-aligned-quad";
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

  constructor(
    private editor: IEditor,
    private renderer: THREE.WebGLRenderer,
    sharedUniforms: SharedUniforms,
  ) {
    this.firstDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.secondDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.outputDerivativeRenderTarget = new THREE.WebGLRenderTarget(1, 1);

    this.gradientMaterial = new GradientMaterial(
      editor,
      this.firstDerivativeRenderTarget.texture,
      this.secondDerivativeRenderTarget.texture,
      sharedUniforms,
    );

    this.screenAlignedQuad = new ScreenAlignedQuad(this.gradientMaterial);

    this.reactionDisposers.push(
      reaction(
        () => editor.activeDocument?.baseImageLayer?.image,
        (image?: Image) => {
          if (!image) return;

          const atlasSize = image.getAtlasSize();

          this.firstDerivativeRenderTarget.setSize(atlasSize.x, atlasSize.y);
          this.secondDerivativeRenderTarget.setSize(atlasSize.x, atlasSize.y);
          this.outputDerivativeRenderTarget.setSize(atlasSize.x, atlasSize.y);

          this.updateAllDerivatives();
        },
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
      this.editor.activeDocument?.viewport3D.shadingMode === "phong" &&
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

  public updateAllDerivatives = () => {
    this.updateFirstDerivative();
    this.updateSecondDerivative();
    this.updateOutputDerivative();
  };

  private updateFirstDerivative() {
    this.firstDerivativeDirty = true;
  }

  private renderFirstDerivative() {
    const isXrEnabled = this.renderer.xr.enabled;
    this.renderer.xr.enabled = false;
    // TODO: Set uInputDimensions depending on image.

    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.First);

    this.renderer.setRenderTarget(this.firstDerivativeRenderTarget);

    this.screenAlignedQuad.renderWith(this.renderer);

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

    this.renderer.xr.enabled = isXrEnabled;

    // TODO: Histogram
    // const gradientMagnitudes = [];
    // const workingVector = new THREE.Vector3();
    // for (let i = 0; i < buffer.length; i += 4) {
    //   workingVector.set(buffer[i], buffer[i + 1], buffer[i + 2]);
    //   gradientMagnitudes.push(workingVector.length());
    // }
    // this.volumeRenderer.model.setGradientHistogram(
    //   generateHistogram(gradientMagnitudes),
    // );

    this.editor.volumeRenderer?.lazyRender(true);
  }

  private updateSecondDerivative() {
    this.secondDerivativeDirty = true;
  }

  private renderSecondDerivative() {
    const isXrEnabled = this.renderer.xr.enabled;
    this.renderer.xr.enabled = false;

    this.gradientMaterial.uniforms.uInputDimensions.value = 3;
    this.gradientMaterial.setGradientMode(GradientMode.Second);

    this.renderer.setRenderTarget(this.secondDerivativeRenderTarget);

    this.screenAlignedQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(null);
    this.renderer.xr.enabled = isXrEnabled;

    this.secondDerivativeDirty = false;

    this.editor.volumeRenderer?.lazyRender(true);
  }

  public updateOutputDerivative = () => {
    this.outputDerivativeDirty = true;
  };

  private renderOutputDerivative() {
    const isXrEnabled = this.renderer.xr.enabled;
    this.renderer.xr.enabled = false;

    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.Output);

    this.renderer.setRenderTarget(this.outputDerivativeRenderTarget);

    this.screenAlignedQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(null);
    this.renderer.xr.enabled = isXrEnabled;

    this.outputDerivativeDirty = false;

    this.editor.volumeRenderer?.lazyRender();
  }
}

export default GradientComputer;
