import { IDocument, IThresholdAnnotationRenderer3D } from "@visian/ui-shared";
import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import {
  thresholdAnnotationFragmentShader,
  thresholdAnnotationVertexShader,
} from "../shaders";
import { ToolRenderer3D } from "./tool-renderer-3d";

export class ThresholdAnnotationRenderer3D
  extends ToolRenderer3D
  implements IThresholdAnnotationRenderer3D
{
  public threshold: [number, number] = [0.05, 1];

  constructor(document: IDocument) {
    super(document, {
      vertexShader: thresholdAnnotationVertexShader,
      fragmentShader: thresholdAnnotationFragmentShader,
      uniforms: { uThreshold: { value: [0.05, 1] } },
      glslVersion: THREE.GLSL3,
    });

    makeObservable(this, {
      threshold: observable,
      setThreshold: action,
    });
  }

  public setThreshold = (value: [number, number]) => {
    this.threshold = value;
    this.material.uniforms.uThreshold.value = value;
  };

  public render() {
    const sourceImage = this.sourceLayer?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    this.material.setSourceTexture(sourceImage.getTexture());

    super.render();
  }
}
