import * as THREE from "three";
import { IDisposable, IDisposer, Voxel } from "@visian/utils";
import { IDocument, IImageLayer } from "@visian/ui-shared";
import { reaction } from "mobx";
import { RenderedImage } from "../rendered-image";
import ScreenAlignedQuad from "../screen-aligned-quad";
import { RegionGrowing3DMaterial, Seed } from "./utils";

export class RegionGrowingRenderer3D implements IDisposable {
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

    this.document.tools.tools["smart-brush-3d"].params.steps?.setValue(244);

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
  }

  public flushToAnnotation() {
    if (
      this.document.activeLayer?.kind !== "image" ||
      !this.document.activeLayer?.isAnnotation
    ) {
      return;
    }

    const annotation = (this.document.activeLayer as IImageLayer)
      .image as RenderedImage;

    const addThreshold = this.document.tools.tools["smart-brush-3d"].params
      .steps?.value as number | undefined;

    annotation.addToAtlas(
      this.outputTextures,
      addThreshold !== undefined ? (255 - addThreshold) / 255 : addThreshold,
    );

    this.clearRenderTargets();

    this.document.sliceRenderer?.lazyRender();
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
