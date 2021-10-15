import { IDocument } from "@visian/ui-shared";
import { Voxel } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import { RenderedImage } from "../rendered-image";
import {
  regionGrowing3DFragmentShader,
  regionGrowingVertexShader,
} from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";
import { MAX_BLIP_STEPS, Seed } from "./utils";

export class RegionGrowingRenderer3D extends BlipRenderer3D {
  public readonly excludeFromSnapshotTracking = ["document"];

  public threshold = 5;

  private seed: Seed;
  private seedVoxel: Voxel = { x: 0, y: 0, z: 0 };

  constructor(document: IDocument) {
    super(document, {
      vertexShader: regionGrowingVertexShader,
      fragmentShader: regionGrowing3DFragmentShader,
      uniforms: { uThreshold: { value: 0.1 }, uSeed: { value: 0 } },
    });

    this.seed = new Seed(document);

    makeObservable(this, {
      threshold: observable,

      setThreshold: action,
      setSeed: action,
    });
  }

  public setThreshold(value: number) {
    this.threshold = value;
  }

  public setSeed(voxel: Voxel) {
    this.clearRenderTargets();

    this.previewColor = this.document.getRegionGrowingPreviewColor();

    this.seedVoxel = voxel;

    this.seed.setPosition(voxel);

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex], voxel.z);
      renderer.render(this.seed, this.seed.camera);
      renderer.setRenderTarget(null);
    });
  }

  public render() {
    const sourceImage = this.sourceLayer?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    const seedValue = sourceImage.getVoxelData(this.seedVoxel).x;
    this.material.uniforms.uSeed.value = seedValue / (MAX_BLIP_STEPS + 1);
    this.material.uniforms.uThreshold.value =
      this.threshold / (MAX_BLIP_STEPS + 1);

    super.render();
  }

  public dispose() {
    super.dispose();
    this.seed.dispose();
  }
}
