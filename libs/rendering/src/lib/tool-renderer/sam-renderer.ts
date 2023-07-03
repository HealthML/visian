import { IDocument } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
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
    const viewType = this.document.viewport2D.mainViewType;

    const { width, height } = this.renderTarget;

    const { data } = this.dataTexture.image;
    for (let i = 0; i < mask.length; i++) {
      const value = mask[i] > 0.0 ? 255 : 0;
      let offset = 0;

      // The 3D texture is stored in transverse orientation, while
      // the incoming mask depends on the current view type, so we
      // need to figure out the correct offset:
      if (viewType === ViewType.Transverse) {
        const x = i % width;
        const y = Math.floor(i / width);
        offset = currentSlice * width * height + y * width + x;
      } else if (viewType === ViewType.Coronal) {
        const x = i % width;
        const z = Math.floor(i / width);
        offset = z * height * width + currentSlice * width + x;
      } else if (viewType === ViewType.Sagittal) {
        const x = i % height;
        const z = Math.floor(i / height);
        offset = z * height * width + x * width + currentSlice;
      }

      data[offset * 4] = value;
      data[offset * 4 + 1] = value;
      data[offset * 4 + 2] = value;
      data[offset * 4 + 3] = value;
    }
    this.dataTexture.needsUpdate = true;
    this.material.setSourceTexture(this.dataTexture);
  }

  protected initDataTexture() {
    const { width, height, depth } = this.renderTarget;
    const data = new Uint8Array(width * height * depth * 4).fill(0);
    this.dataTexture = new Data3DTexture(data, width, height, depth);
    this.material.setSourceTexture(this.dataTexture);
  }
}
