import {
  IDilateErodeRenderer3D,
  IDocument,
  IImageLayer,
} from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import { dilateErodeFragmentShader, dilateErodeVertexShader } from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";

export class DilateErodeRenderer3D
  extends BlipRenderer3D
  implements IDilateErodeRenderer3D {
  public shouldErode = false;
  public targetLayer?: IImageLayer;
  public shouldAutoCompensate = true;

  constructor(document: IDocument) {
    super(document, {
      vertexShader: dilateErodeVertexShader,
      fragmentShader: dilateErodeFragmentShader,
      uniforms: { uShouldErode: { value: false } },
      glslVersion: THREE.GLSL3,
    });

    this.maxSteps = 1;

    makeObservable(this, {
      shouldErode: observable,
      targetLayer: observable,
      shouldAutoCompensate: observable,

      setShouldErode: action,
      setTargetLayer: action,
      setShouldAutoCompensate: action,
    });
  }

  public setShouldErode = (value: boolean) => {
    this.shouldErode = value;
    this.material.uniforms.uShouldErode.value = value;
  };

  public setTargetLayer(value: IImageLayer) {
    this.targetLayer = value;
  }

  public setShouldAutoCompensate = (value: boolean) => {
    this.shouldAutoCompensate = value;
    if (this.holdsPreview) {
      this.render();
    }
  };

  public render = () => {
    if (!this.targetLayer) return;

    super.render(this.targetLayer);
    if (this.shouldAutoCompensate) {
      this.material.uniforms.uShouldErode.value = !this.shouldErode;
      super.render();
      this.material.uniforms.uShouldErode.value = this.shouldErode;
    }
  };

  public get outputTextures() {
    return this.maxSteps === 0 && this.targetLayer
      ? this.renderTargets.map((_renderTarget, rendererIndex) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (this.targetLayer!.image as RenderedImage).getTexture(rendererIndex),
        )
      : super.outputTextures;
  }

  public discard() {
    this.targetLayer = undefined;
    super.discard();
  }
}
