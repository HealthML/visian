import { IDocument, IThresholdAnnotationRenderer3D } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";

import {
  thresholdAnnotationFragmentShader,
  thresholdAnnotationVertexShader,
} from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";

export class ThresholdAnnotationRenderer3D
  extends BlipRenderer3D
  implements IThresholdAnnotationRenderer3D {
  public threshold: [number, number] = [0.05, 1];

  constructor(document: IDocument) {
    super(document, {
      vertexShader: thresholdAnnotationVertexShader,
      fragmentShader: thresholdAnnotationFragmentShader,
    });
    this.material.uniforms.uThreshold = { value: this.threshold };
    this.maxSteps = 1;

    makeObservable(this, {
      threshold: observable,

      setThreshold: action,
    });
  }

  public setThreshold = (value: [number, number]) => {
    this.threshold = value;
    this.material.uniforms.uThreshold.value = value;
  };
}
