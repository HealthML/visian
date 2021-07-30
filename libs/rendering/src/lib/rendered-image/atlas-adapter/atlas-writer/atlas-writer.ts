import * as THREE from "three";
import ScreenAlignedQuad from "../../../screen-aligned-quad";
import { AddMaterial } from "./add-material";

/**
 * Wrapper providing a clean interface for using the `AddMaterial` to add one
 * texture atlas to another.
 * See `./atlas-writer.ts` for more details.
 */
export class AtlasWriter {
  private addMaterial = new AddMaterial();
  private addQuad: ScreenAlignedQuad;

  constructor() {
    this.addQuad = new ScreenAlignedQuad(this.addMaterial);
  }

  public addToAltas(
    data: THREE.Texture[],
    threshold: number,
    renderTargets: THREE.WebGLRenderTarget[],
    renderers: THREE.WebGLRenderer[],
  ) {
    renderTargets.forEach((renderTarget, rendererIndex) => {
      const renderer = renderers[rendererIndex];
      this.addMaterial.setSource(data[rendererIndex]);
      this.addMaterial.setThreshold(threshold);
      renderer.setRenderTarget(renderTarget);
      renderer.autoClear = false;
      this.addQuad.renderWith(renderer);
      renderer.autoClear = true;
      renderer.setRenderTarget(null);
    });
  }
}
