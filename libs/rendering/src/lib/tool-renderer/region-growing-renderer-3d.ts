import { IDocument } from "@visian/ui-shared";
import { Voxel } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import {
  regionGrowing3DFragmentShader,
  regionGrowing3DVertexShader,
} from "../shaders";
import { BlipRenderer3D } from "./blip-renderer-3d";
import { Seed } from "./utils";

export class RegionGrowingRenderer3D extends BlipRenderer3D {
  public readonly excludeFromSnapshotTracking = ["document"];

  public threshold = 5;

  private seed: Seed;
  private seedVoxel: Voxel = { x: 0, y: 0, z: 0 };

  constructor(document: IDocument) {
    super(document, {
      vertexShader: regionGrowing3DVertexShader,
      fragmentShader: regionGrowing3DFragmentShader,
      uniforms: {
        uThreshold: { value: 0.1 },
        uSeed: { value: [0, 0, 0, 0] },
        uComponents: { value: 1 },
      },
      glslVersion: THREE.GLSL3,
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
    this.clearRenderTarget();

    this.previewColor = this.document.getAnnotationPreviewColor();

    this.seedVoxel = voxel;

    this.seed.setPosition(voxel);

    this.document.renderer?.setRenderTarget(this.renderTarget, voxel.z);
    this.document.renderer?.render(this.seed, this.seed.camera);
    this.document.renderer?.setRenderTarget(null);
  }

  public render() {
    const sourceImage = this.sourceLayer?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    const seedValues = sourceImage.getVoxelData(this.seedVoxel).toArray();
    seedValues.forEach((value, index) => {
      this.material.uniforms.uSeed.value[index] = value;
    });
    this.material.uniforms.uThreshold.value = this.threshold / 255;
    this.material.uniforms.uComponents.value = sourceImage.voxelComponents;

    super.render(undefined, (step: number) => [
      this.seedVoxel.z - (step + 1),
      this.seedVoxel.z + (step + 1),
    ]);
  }

  public dispose() {
    super.dispose();
    this.seed.dispose();
  }
}
