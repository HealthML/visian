import { IDocument, ISamRenderer } from "@visian/ui-shared";
import { action, makeObservable, observable, reaction } from "mobx";
import { Data3DTexture, GLSL3 } from "three";

import { samPreviewFragmentShader, samPreviewVertexShader } from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";

export class SamRenderer extends BlipRenderer3D implements ISamRenderer {
  public readonly excludeFromSnapshotTracking = ["document"];

  private dataTexture!: Data3DTexture;
  public showsMask = false;

  constructor(document: IDocument) {
    super(document, {
      vertexShader: samPreviewVertexShader,
      fragmentShader: samPreviewFragmentShader,
      uniforms: {
        uDataTexture: { value: null },
      },
      glslVersion: GLSL3,
    });

    makeObservable(this, {
      showsMask: observable,
      setShowsMask: action,
    });

    // reaction(
    //   () => [
    //     this.document.mainImageLayer?.image.voxelCount.toArray(),
    //     this.document.mainImageLayer?.image.defaultViewType,
    //   ],
    //   this.initDataTexture,
    // );
  }

  public setShowsMask(showsMask: boolean) {
    this.showsMask = showsMask;
  }

  protected initDataTexture() {
    const { mainImageLayer } = this.document;
    if (!mainImageLayer) return;
    const { width, height, depth } = this.getLayerSize(mainImageLayer);

    const data = new Uint8Array(width * height * depth * 4).fill(0);
    this.dataTexture = new Data3DTexture(data, width, height, depth);
  }

  public render() {
    this.material.uniforms.uDataTexture.value = this.dataTexture;
    console.log("rendering sam renderer");

    super.render(undefined, () => [0, 150]);
  }

  public dispose() {
    super.dispose();
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
    if (!this.dataTexture) this.initDataTexture();
    const currentSlice = this.document.viewport2D.getSelectedSlice();

    const { data } = this.dataTexture.image;
    const sliceOffset = currentSlice * 240 * 240 * 4;
    for (let i = 0; i < mask.length; i++) {
      const value = mask[i] > 0.0 ? 255 : 0;
      data[sliceOffset + i * 4] = value;
      data[sliceOffset + i * 4 + 1] = value;
      data[sliceOffset + i * 4 + 2] = value;
      data[sliceOffset + i * 4 + 3] = value;
    }
    this.dataTexture.needsUpdate = true;
  }
}
