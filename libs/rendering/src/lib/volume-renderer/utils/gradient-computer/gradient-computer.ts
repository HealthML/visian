import {
  IConeTransferFunction,
  ICustomTransferFunction,
  IEditor,
  IImageLayer,
} from "@visian/ui-shared";
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
    private sharedUniforms: SharedUniforms,
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
        () => {
          const imageId =
            editor.activeDocument?.viewport3D.activeTransferFunction?.params
              .image?.value;

          if (!imageId) return undefined;

          const imageLayer = editor.activeDocument?.getLayer(imageId as string);

          if (!imageLayer) return undefined;

          return (imageLayer as IImageLayer).image;
        },
        (image?: Image) => {
          if (!image) return;

          const atlasSize = image.getAtlasSize();

          this.firstDerivativeRenderTarget.setSize(atlasSize.x, atlasSize.y);
          this.secondDerivativeRenderTarget.setSize(atlasSize.x, atlasSize.y);
          this.outputDerivativeRenderTarget.setSize(atlasSize.x, atlasSize.y);

          this.updateFirstDerivative();
          this.updateSecondDerivative();
          this.updateOutputDerivative();
        },
      ),
      reaction(
        () => {
          const coneTransferFunction = this.editor.activeDocument?.viewport3D
            .transferFunctions["fc-cone"];

          if (!coneTransferFunction) return undefined;

          return (coneTransferFunction as IConeTransferFunction).coneDirection.toArray();
        },
        () => {
          if (
            this.editor.activeDocument?.viewport3D.activeTransferFunction
              ?.name === "fc-cone"
          ) {
            this.updateOutputDerivative();
          }
        },
      ),
      reaction(() => {
        const annotationId = editor.activeDocument?.viewport3D
          .activeTransferFunction?.params.annotation?.value as
          | string
          | undefined;
        const annotationLayer =
          annotationId && editor.activeDocument
            ? (editor.activeDocument.getLayer(
                annotationId as string,
              ) as IImageLayer)
            : undefined;

        const customTransferFunction =
          editor.activeDocument?.viewport3D.transferFunctions.custom;
        const customTransferFunctionTexture = customTransferFunction
          ? (customTransferFunction as ICustomTransferFunction).texture
          : undefined;

        return [
          annotationLayer?.image,
          customTransferFunctionTexture,
          editor.activeDocument?.layers.map((layer) => layer.isVisible),
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .useFocus?.value,
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .focusOpacity?.value,
          editor.activeDocument?.viewport3D.opacity,
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .contextOpacity?.value,
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .densityRange?.value,
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .coneAngle?.value,
          editor.activeDocument?.viewport3D.activeTransferFunction?.name,
        ];
      }, this.updateOutputDerivative),
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

  private updateFirstDerivative() {
    this.firstDerivativeDirty = true;
  }

  private renderFirstDerivative() {
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

    const gradientMagnitudes = [];
    const workingVector = new THREE.Vector3();
    for (let i = 0; i < buffer.length; i += 4) {
      workingVector.set(buffer[i], buffer[i + 1], buffer[i + 2]);
      gradientMagnitudes.push(workingVector.length());
    }

    // TODO: Histogram
    // this.volumeRenderer.model.setGradientHistogram(
    //   generateHistogram(gradientMagnitudes),
    // );

    this.editor.volumeRenderer?.lazyRender();
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

    this.editor.volumeRenderer?.lazyRender();
  }

  private updateOutputDerivative = () => {
    this.outputDerivativeDirty = true;
  };

  private renderOutputDerivative() {
    this.gradientMaterial.uniforms.uInputDimensions.value = 1;
    this.gradientMaterial.setGradientMode(GradientMode.Output);

    this.renderer.setRenderTarget(this.outputDerivativeRenderTarget);

    this.screenAlignedQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(null);

    this.outputDerivativeDirty = false;

    this.editor.volumeRenderer?.lazyRender();
  }
}

export default GradientComputer;
