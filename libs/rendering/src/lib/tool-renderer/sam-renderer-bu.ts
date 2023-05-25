import { IDocument, ISamRenderer } from "@visian/ui-shared";
import { Vector, ViewType } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import { Data3DTexture, DataTexture, NearestFilter } from "three";

import { ImageRenderTarget } from "../rendered-image";
import { Texture3DRenderer } from "../texture-3d-renderer";
import { ToolRenderer } from "./tool-renderer";
import { SamPreviewMaterial } from "./utils/sam-preview-material";

export class SamRenderer extends ToolRenderer implements ISamRenderer {
  protected samPreviewTexture: DataTexture;
  protected samPreviewMaterial: SamPreviewMaterial;
  // protected samPreviewQuad: ScreenAlignedQuad;

  protected texture3DRenderer: Texture3DRenderer;

  protected renderTarget2: THREE.WebGLRenderTarget;

  public previewColor = "#ff0000";

  public showsMask = false;

  constructor(document: IDocument) {
    super(document);

    this.renderTarget2 = new ImageRenderTarget(
      {
        voxelCount: new Vector([1, 1, 1]),
        is3D: false,
        defaultViewType: ViewType.Transverse,
      },
      NearestFilter,
    ).target;

    this.texture3DRenderer = new Texture3DRenderer();

    this.samPreviewMaterial = new SamPreviewMaterial();
    // this.samPreviewQuad = new ScreenAlignedQuad(this.samPreviewMaterial);

    const data = new Uint8Array(240 * 240 * 4).fill(0);
    this.samPreviewTexture = new Data3DTexture(data, 240, 240);
    this.samPreviewMaterial.setDataTexture(this.samPreviewTexture);
    this.samPreviewMaterial.setSlice(78);

    makeObservable(this, {
      previewColor: observable,
      showsMask: observable,

      setPreviewColor: action,
      setShowsMask: action,
    });
  }

  public setPreviewColor(color: string) {
    this.previewColor = color;
  }

  public setShowsMask(showsMask: boolean) {
    this.showsMask = showsMask;
  }

  public get outputTexture() {
    return this.renderTarget2.texture;
  }

  public dispose() {
    super.dispose();

    this.samPreviewTexture?.dispose();
    this.samPreviewMaterial.dispose();
    // this.samPreviewQuad.dispose();
  }

  public showMask(mask: Float32Array) {
    this.updatePreviewTexture(mask);
    this.render();
    this.setShowsMask(true);
  }

  public clearMask() {
    this.updatePreviewTexture(new Float32Array(240 * 240).fill(0));
    this.render();
    this.setShowsMask(false);
  }

  protected updatePreviewTexture(mask: Float32Array) {
    const { data } = this.samPreviewTexture.image;
    for (let i = 0; i < mask.length; i++) {
      const value = mask[i] > 0.0 ? 255 : 0;
      data[i * 4] = value;
      data[i * 4 + 1] = value;
      data[i * 4 + 2] = value;
      data[i * 4 + 3] = value;
    }
    this.samPreviewTexture.needsUpdate = true;
  }

  public render() {
    if (!this.document.renderer) return;

    this.texture3DRenderer.setMaterial(this.samPreviewMaterial);
    this.samPreviewMaterial.setDataTexture(this.samPreviewTexture);

    this.texture3DRenderer.render(this.document.renderer, [1, 130], true);

    // this.document.renderer.setRenderTarget(this.renderTarget2);
    // this.document.renderer.autoClear = true;

    // // this.samPreviewQuad.renderWith(this.document.renderer);

    // this.document.renderer.setRenderTarget(null);
    // this.document.renderer.autoClear = true;
  }
}
