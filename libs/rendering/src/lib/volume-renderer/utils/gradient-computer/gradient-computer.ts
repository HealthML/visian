import { Texture3DRenderer } from "@visian/rendering";
import { IEditor } from "@visian/ui-shared";
import { IDisposable, Vector, ViewType } from "@visian/utils";
import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";
import { ImageRenderTarget } from "../../../rendered-image";

import { SharedUniforms } from "../shared-uniforms";
import { GradientMaterial, GradientMode } from "./gradient-material";

export class GradientComputer implements IDisposable {
  private gradientMaterial: GradientMaterial;

  private firstDerivativeRenderTarget: THREE.WebGLRenderTarget;
  // private secondDerivativeRenderTarget: THREE.WebGLRenderTarget;
  private outputDerivativeRenderTarget: THREE.WebGLRenderTarget;

  private firstDerivativeDirty = true;
  // private secondDerivativeDirty = true;
  private outputDerivativeDirty = true;

  private texture3DRenderer = new Texture3DRenderer();

  private reactionDisposers: IReactionDisposer[] = [];

  constructor(
    private editor: IEditor,
    private renderer: THREE.WebGLRenderer,
    sharedUniforms: SharedUniforms,
  ) {
    const imageProperties = {
      voxelCount: new Vector([1, 1, 1]),
      is3D: true,
      defaultViewType: ViewType.Transverse,
    };
    this.firstDerivativeRenderTarget = new ImageRenderTarget(
      imageProperties,
      THREE.LinearFilter,
    );
    // this.secondDerivativeRenderTarget = new ImageRenderTarget(
    //   imageProperties,
    //   THREE.LinearFilter,
    // );
    this.outputDerivativeRenderTarget = new ImageRenderTarget(
      imageProperties,
      THREE.LinearFilter,
    );

    this.gradientMaterial = new GradientMaterial(
      editor,
      this.firstDerivativeRenderTarget.texture,
      // this.secondDerivativeRenderTarget.texture,
      sharedUniforms,
    );
    this.texture3DRenderer.setMaterial(this.gradientMaterial);

    this.reactionDisposers.push(
      autorun(() => {
        const mainImageLayer = this.editor.activeDocument?.mainImageLayer;
        if (!mainImageLayer?.is3DLayer) return;

        const { voxelCount } = mainImageLayer.image;

        [
          this.firstDerivativeRenderTarget,
          // this.secondDerivativeRenderTarget,
          this.outputDerivativeRenderTarget,
        ].forEach((renderTarget) => {
          renderTarget.setSize(voxelCount.x, voxelCount.y, voxelCount.z);
        });
      }),
    );
  }

  public dispose() {
    this.gradientMaterial.dispose();
    this.reactionDisposers.forEach((disposer) => disposer());
    this.firstDerivativeRenderTarget.dispose();
    // this.secondDerivativeRenderTarget.dispose();
    this.outputDerivativeRenderTarget.dispose();
    this.texture3DRenderer.dispose();
  }

  public tick() {
    if (this.firstDerivativeDirty) {
      this.renderFirstDerivative();
    }
    // if (this.secondDerivativeDirty) {
    //   this.renderSecondDerivative();
    // }
    if (
      (this.editor.activeDocument?.viewport3D.shadingMode === "phong" ||
        this.editor.activeDocument?.viewport3D.requestedShadingMode ===
          "phong") &&
      this.outputDerivativeDirty
    ) {
      this.renderOutputDerivative();
    } else if (
      this.editor.activeDocument?.viewport3D.requestedShadingMode === "phong"
    ) {
      this.editor.activeDocument?.viewport3D.confirmRequestedShadingMode();
    }
  }

  public getFirstDerivative() {
    return this.firstDerivativeRenderTarget.texture;
  }

  // public getSecondDerivative() {
  //   return this.secondDerivativeRenderTarget.texture;
  // }

  public getOutputDerivative() {
    return this.outputDerivativeRenderTarget.texture;
  }

  public updateAllDerivatives = () => {
    this.updateFirstDerivative();
    // this.updateSecondDerivative();
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

    this.texture3DRenderer.setTarget(this.firstDerivativeRenderTarget);

    this.texture3DRenderer.render(this.renderer);

    this.renderer.setRenderTarget(null);

    this.gradientMaterial.setGradientMode();

    this.firstDerivativeDirty = false;
    // const buffer = new Uint8Array(
    //   this.firstDerivativeRenderTarget.width *
    //     this.firstDerivativeRenderTarget.height *
    //     4,
    // );
    // this.renderer.readRenderTargetPixels(
    //   this.firstDerivativeRenderTarget,
    //   0,
    //   0,
    //   this.firstDerivativeRenderTarget.width,
    //   this.firstDerivativeRenderTarget.height,
    //   buffer,
    // );

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

  // private updateSecondDerivative() {
  //   this.secondDerivativeDirty = true;
  // }

  // private renderSecondDerivative() {
  // const isXrEnabled = this.renderer.xr.enabled;
  // this.renderer.xr.enabled = false;

  // this.gradientMaterial.uniforms.uInputDimensions.value = 3;
  // this.gradientMaterial.setGradientMode(GradientMode.Second);

  // this.texture3DRenderer.setTarget(this.secondDerivativeRenderTarget);

  // this.texture3DRenderer.render(this.renderer);

  // this.renderer.setRenderTarget(null);

  // this.gradientMaterial.setGradientMode();

  // this.renderer.xr.enabled = isXrEnabled;

  // this.secondDerivativeDirty = false;

  // this.editor.volumeRenderer?.lazyRender(true);
  // }

  public updateOutputDerivative = () => {
    this.outputDerivativeDirty = true;
  };

  private renderOutputDerivative() {
    const isXrEnabled = this.renderer.xr.enabled;
    this.renderer.xr.enabled = false;

    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.Output);

    this.texture3DRenderer.setTarget(this.outputDerivativeRenderTarget);

    this.texture3DRenderer.render(this.renderer);

    this.gradientMaterial.setGradientMode();

    this.renderer.setRenderTarget(null);
    this.renderer.xr.enabled = isXrEnabled;

    this.outputDerivativeDirty = false;
    if (
      this.editor.activeDocument?.viewport3D.requestedShadingMode === "phong"
    ) {
      this.editor.activeDocument?.viewport3D.confirmRequestedShadingMode();
    }

    this.editor.volumeRenderer?.lazyRender();
  }
}
