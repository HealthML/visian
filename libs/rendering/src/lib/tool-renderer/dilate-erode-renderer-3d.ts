import {
  IDilateErodeRenderer3D,
  IDocument,
  IImageLayer,
} from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";

import { RenderedImage } from "../rendered-image";
import { dilateErodeFragmentShader, dilateErodeVertexShader } from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";

export class DilateErodeRenderer3D
  extends BlipRenderer3D
  implements IDilateErodeRenderer3D {
  public shouldErode = false;
  public sourceLayer?: IImageLayer;
  public shouldAutoCompensate = false;

  constructor(document: IDocument) {
    super(document, {
      vertexShader: dilateErodeVertexShader,
      fragmentShader: dilateErodeFragmentShader,
    });
    this.material.uniforms.uShouldErode = { value: this.shouldErode };
    this.maxSteps = 1;

    makeObservable(this, {
      shouldErode: observable,
      sourceLayer: observable,
      shouldAutoCompensate: observable,

      setShouldErode: action,
      setSourceLayer: action,
      setShouldAutoCompensate: action,
    });
  }

  public setShouldErode = (value: boolean) => {
    this.shouldErode = value;
    this.material.uniforms.uShouldErode.value = value;
  };

  public setSourceLayer(value: IImageLayer) {
    this.sourceLayer = value;
  }

  public setShouldAutoCompensate = (value: boolean) => {
    this.shouldAutoCompensate = value;
    if (this.holdsPreview) {
      this.render();
    }
  };

  public render = () => {
    if (!this.sourceLayer) return;

    super.render(this.sourceLayer);
    if (this.shouldAutoCompensate) {
      this.material.uniforms.uShouldErode.value = !this.shouldErode;
      super.render();
      this.material.uniforms.uShouldErode.value = this.shouldErode;
    }
  };

  public get outputTextures() {
    return this.maxSteps === 0 && this.sourceLayer
      ? this.renderTargets.map((_renderTarget, rendererIndex) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (this.sourceLayer!.image as RenderedImage).getTexture(rendererIndex),
        )
      : super.outputTextures;
  }

  public discard() {
    this.sourceLayer = undefined;
    super.discard();
  }
}
