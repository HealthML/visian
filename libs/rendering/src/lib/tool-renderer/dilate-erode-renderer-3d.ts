import { IDocument } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";

import { dilateErodeFragmentShader, dilateErodeVertexShader } from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";

export class DilateErodeRenderer3D extends BlipRenderer3D {
  public shouldErode = false;

  constructor(document: IDocument) {
    super(document, {
      vertexShader: dilateErodeVertexShader,
      fragmentShader: dilateErodeFragmentShader,
    });
    this.material.uniforms.uShouldErode = { value: this.shouldErode };
    this.maxSteps = 1;

    makeObservable(this, { shouldErode: observable, setShouldErode: action });
  }

  public setShouldErode = (value: boolean) => {
    this.shouldErode = value;
    this.material.uniforms.uShouldErode.value = value;
  };
}
