import {
  IDilateErodeRenderer3D,
  IDocument,
  IImageLayer,
} from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";

import { dilateErodeFragmentShader, dilateErodeVertexShader } from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";

export class DilateErodeRenderer3D
  extends BlipRenderer3D
  implements IDilateErodeRenderer3D {
  public shouldErode = false;
  public sourceLayer?: IImageLayer;

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

      setShouldErode: action,
      setSourceLayer: action,
    });
  }

  public setShouldErode = (value: boolean) => {
    this.shouldErode = value;
    this.material.uniforms.uShouldErode.value = value;
  };

  public setSourceLayer(value: IImageLayer) {
    this.sourceLayer = value;
  }

  public render = () => {
    super.render(this.sourceLayer);
  };

  public discard() {
    this.sourceLayer = undefined;
    super.discard();
  }
}
