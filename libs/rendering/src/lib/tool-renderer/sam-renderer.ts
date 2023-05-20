import { IDocument } from "@visian/ui-shared";
import { DataTexture } from "three";

import { ScreenAlignedQuad } from "../screen-aligned-quad";
import { ToolRenderer } from "./tool-renderer";
import { SamPreviewMaterial } from "./utils/sam-preview-material";

export class SamRenderer extends ToolRenderer {
  protected samPreviewTexture?: DataTexture;
  protected samPreviewMaterial: SamPreviewMaterial;
  protected samPreviewQuad: ScreenAlignedQuad;

  constructor(document: IDocument) {
    super(document);

    this.samPreviewMaterial = new SamPreviewMaterial();
    this.samPreviewQuad = new ScreenAlignedQuad(this.samPreviewMaterial);
  }

  public dispose() {
    super.dispose();

    this.samPreviewTexture?.dispose();
    this.samPreviewMaterial.dispose();
    this.samPreviewQuad.dispose();
  }

  public showMask(mask: Float32Array) {
    if (!this.document.renderer) return;

    if (!this.samPreviewTexture) {
      const data = new Uint8Array(240 * 240 * 4).fill(0);
      this.samPreviewTexture = new DataTexture(data, 240, 240);
      this.samPreviewMaterial.setDataTexture(this.samPreviewTexture);
    }

    const { data } = this.samPreviewTexture.image;
    for (let i = 0; i < mask.length; i++) {
      const value = mask[i] > 0.0 ? 255 : 0;
      data[i * 4] = value;
      data[i * 4 + 1] = value;
      data[i * 4 + 2] = value;
      data[i * 4 + 3] = value;
    }
    this.samPreviewTexture.needsUpdate = true;

    this.document.renderer.setRenderTarget(this.renderTarget);
    this.document.renderer.autoClear = true;

    this.samPreviewQuad.renderWith(this.document.renderer);

    this.document.renderer.setRenderTarget(null);
    this.document.renderer.autoClear = true;
  }
}
