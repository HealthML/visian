import { IDocument } from "@visian/ui-shared";
import { Data3DTexture, GLSL3 } from "three";

import { samPreviewFragmentShader, samPreviewVertexShader } from "../shaders";
import { ToolRenderer3D } from "./tool-renderer-3d";

export class SamRenderer extends ToolRenderer3D {
  public readonly excludeFromSnapshotTracking = ["document", "dataTexture"];

  protected dataTexture!: Data3DTexture;

  constructor(document: IDocument) {
    super(document, {
      vertexShader: samPreviewVertexShader,
      fragmentShader: samPreviewFragmentShader,
      glslVersion: GLSL3,
    });
    this.setPreviewColor(document.getAnnotationPreviewColor());
  }

  public showMask(mask: Float32Array) {
    this.updatePreviewTexture(mask);
    this.render();
  }

  public clearMask() {
    this.initDataTexture();
    this.render();
  }

  protected updatePreviewTexture(mask: Float32Array) {
    if (!this.dataTexture) this.initDataTexture();
    const currentSlice = this.document.viewport2D.getSelectedSlice();

    const { mainImageLayer } = this.document;
    if (!mainImageLayer) return;
    const { width, height } = this.renderTarget;

    const { data } = this.dataTexture.image;
    const sliceOffset = currentSlice * width * height * 4;
    for (let i = 0; i < mask.length; i++) {
      const value = mask[i] > 0.0 ? 255 : 0;
      data[sliceOffset + i * 4] = value;
      data[sliceOffset + i * 4 + 1] = value;
      data[sliceOffset + i * 4 + 2] = value;
      data[sliceOffset + i * 4 + 3] = value;
    }
    this.dataTexture.needsUpdate = true;
    this.material.setSourceTexture(this.dataTexture);
  }

  protected initDataTexture() {
    const { width, height, depth } = this.renderTarget;
    const data = new Uint8Array(width * height * depth * 4).fill(0);
    this.dataTexture = new Data3DTexture(data, width, height, depth);
  }
}
