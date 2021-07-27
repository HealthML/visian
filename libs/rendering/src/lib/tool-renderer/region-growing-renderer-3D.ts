import {
  IDocument,
  IImageLayer,
  IRegionGrowingRenderer3D,
} from "@visian/ui-shared";
import { IDisposable, IDisposer, Voxel } from "@visian/utils";
import { action, makeObservable, observable, reaction } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import ScreenAlignedQuad from "../screen-aligned-quad";
import { RegionGrowing3DMaterial, Seed } from "./utils";

const MAX_STEPS = 244;

export class RegionGrowingRenderer3D
  implements IRegionGrowingRenderer3D, IDisposable {
  public readonly excludeFromSnapshotTracking = ["document"];

  public holdsPreview = false;
  public previewColor?: string;
  public steps = MAX_STEPS;

  private disposers: IDisposer[] = [];

  private renderTargets: THREE.WebGLRenderTarget[] = [];
  private blipRenderTargets: THREE.WebGLRenderTarget[] = [];

  private regionGrowingMaterial = new RegionGrowing3DMaterial();
  private regionGrowingQuad: ScreenAlignedQuad;

  private seed: Seed;
  private seedVoxel: Voxel = { x: 0, y: 0, z: 0 };

  constructor(private document: IDocument) {
    this.regionGrowingQuad = new ScreenAlignedQuad(this.regionGrowingMaterial);

    this.seed = new Seed(document);

    this.disposers.push(
      reaction(
        () => document.renderers,
        (renderers) => {
          if (renderers) {
            this.renderTargets = renderers.map(
              () =>
                new THREE.WebGLRenderTarget(1, 1, {
                  magFilter: THREE.NearestFilter,
                  minFilter: THREE.NearestFilter,
                }),
            );
            this.blipRenderTargets = renderers.map(
              () =>
                new THREE.WebGLRenderTarget(1, 1, {
                  magFilter: THREE.NearestFilter,
                  minFilter: THREE.NearestFilter,
                }),
            );
            this.resizeRenderTargets();
          }
        },
        { fireImmediately: true },
      ),
      reaction(
        () =>
          document.activeLayer?.kind === "image"
            ? (document.activeLayer as IImageLayer).image.getAtlasSize()
            : undefined,
        this.resizeRenderTargets,
      ),
    );

    makeObservable(this, {
      holdsPreview: observable,
      previewColor: observable,
      steps: observable,
      setPreviewColor: action,
      doRegionGrowing: action,
      setSteps: action,
      flushToAnnotation: action,
    });
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.regionGrowingMaterial.dispose();
    this.regionGrowingQuad.dispose();
    this.seed.dispose();
    [...this.renderTargets, ...this.blipRenderTargets].forEach((rendertarget) =>
      rendertarget.dispose(),
    );
  }

  public setSeed(voxel: Voxel) {
    this.clearRenderTargets();

    this.seedVoxel = voxel;

    this.seed.setPosition(voxel);

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex]);
      renderer.render(this.seed, this.seed.camera);
      renderer.setRenderTarget(null);
    });
  }

  public setPreviewColor = (value: string) => {
    this.previewColor = value;
  };

  public doRegionGrowing(threshold: number) {
    const sourceImage = (this.document.layers.find(
      (layer) =>
        layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
    ) as IImageLayer | undefined)?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    const seedValue = sourceImage.getVoxelData(this.seedVoxel);
    this.regionGrowingMaterial.setSeed(seedValue);
    this.regionGrowingMaterial.setAtlasGird(
      sourceImage.getAtlasGrid().toArray(),
    );
    this.regionGrowingMaterial.setVoxelCount(sourceImage.voxelCount.toArray());
    this.regionGrowingMaterial.setThreshold(threshold);

    this.steps = MAX_STEPS;

    const blipSteps = Math.ceil(
      Math.min(254, sourceImage.voxelCount.sum()) / 2,
    );

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      this.regionGrowingMaterial.setDataTexture(
        sourceImage.getTexture(rendererIndex),
      );

      renderer.autoClear = false;

      for (let i = 0; i < blipSteps; i++) {
        this.regionGrowingMaterial.setRegionTexture(
          this.renderTargets[rendererIndex].texture,
        );
        this.regionGrowingMaterial.setStep(2 * i);
        renderer.setRenderTarget(this.blipRenderTargets[rendererIndex]);
        this.regionGrowingQuad.renderWith(renderer);

        this.regionGrowingMaterial.setRegionTexture(
          this.blipRenderTargets[rendererIndex].texture,
        );
        this.regionGrowingMaterial.setStep(2 * i + 1);
        renderer.setRenderTarget(this.renderTargets[rendererIndex]);
        this.regionGrowingQuad.renderWith(renderer);
      }

      renderer.setRenderTarget(null);
      renderer.autoClear = true;
    });

    this.previewColor = this.document.getFirstUnusedColor();
    this.holdsPreview = true;
  }

  public setSteps = (value: number) => {
    this.steps = Math.min(value, MAX_STEPS);
  };

  public flushToAnnotation() {
    if (
      this.document.activeLayer?.kind !== "image" ||
      !this.document.activeLayer?.isAnnotation
    ) {
      return;
    }

    const annotation = (this.document.activeLayer as IImageLayer)
      .image as RenderedImage;

    annotation.addToAtlas(
      this.outputTextures,
      this.steps !== undefined ? (255 - this.steps) / 255 : this.steps,
    );

    this.clearRenderTargets();
    this.holdsPreview = false;

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public get outputTextures() {
    return this.renderTargets.map((renderTarget) => renderTarget.texture);
  }

  private resizeRenderTargets = () => {
    if (this.document.activeLayer?.kind !== "image") return;

    const [width, height] = (this.document.activeLayer as IImageLayer).image
      .getAtlasSize()
      .toArray();

    [...this.renderTargets, ...this.blipRenderTargets].forEach(
      (renderTarget) => {
        renderTarget.setSize(width, height);
      },
    );
  };

  private clearRenderTargets() {
    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(this.blipRenderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(null);
    });
  }
}
