import * as THREE from "three";

import ScreenAlignedQuad from "../../../screen-aligned-quad";
import { MergeFunction } from "../../types";
import { MergeMaterial } from "./merge-material";

/**
 * Wrapper providing a clean interface for using the `AddMaterial` to add one
 * texture atlas to another.
 * See `./atlas-writer.ts` for more details.
 */
export class AtlasWriter {
  private addMaterial = new MergeMaterial();
  private addQuad: ScreenAlignedQuad;

  constructor() {
    this.addQuad = new ScreenAlignedQuad(this.addMaterial);
  }

  public writeToAltas(
    data: THREE.Texture[],
    renderTargets: THREE.WebGLRenderTarget[],
    renderers: THREE.WebGLRenderer[],
    mergeFunction: MergeFunction,
    threshold?: number,
  ) {
    renderTargets.forEach((renderTarget, rendererIndex) => {
      const renderer = renderers[rendererIndex];
      this.addMaterial.setSource(data[rendererIndex]);
      this.addMaterial.setMergeFunction(mergeFunction);
      this.addMaterial.setThreshold(threshold);
      renderer.setRenderTarget(renderTarget);
      renderer.autoClear = false;
      this.addQuad.renderWith(renderer);
      renderer.autoClear = true;
      renderer.setRenderTarget(null);
    });
  }
}
