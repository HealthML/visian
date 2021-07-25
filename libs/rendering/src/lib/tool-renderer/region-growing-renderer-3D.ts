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
              () => new THREE.WebGLRenderTarget(1, 1),
            );
            this.blipRenderTargets = renderers.map(
              () => new THREE.WebGLRenderTarget(1, 1),
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
    this.seedVoxel = voxel;

    this.seed.setPosition(voxel);

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex]);
      renderer.render(this.seed, this.seed.camera);
      renderer.setRenderTarget(null);
    });

    this.flushToAnnotation();
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

    const blipSteps = Math.min(255, sourceImage.voxelCount.sum());

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      this.regionGrowingMaterial.setDataTexture(
        sourceImage.getTexture(rendererIndex),
      );

      renderer.autoClear = false;

      for (let i = 0; i < blipSteps; i++) {
        this.regionGrowingMaterial.setRegionTexture(
          this.renderTargets[rendererIndex].texture,
        );
        renderer.setRenderTarget(this.blipRenderTargets[rendererIndex]);
        this.regionGrowingQuad.renderWith(renderer);

        this.regionGrowingMaterial.setRegionTexture(
          this.blipRenderTargets[rendererIndex].texture,
        );
        renderer.setRenderTarget(this.renderTargets[rendererIndex]);
        this.regionGrowingQuad.renderWith(renderer);
      }

      renderer.setRenderTarget(null);
      renderer.autoClear = true;
    });

    this.flushToAnnotation();
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
    annotation.addToAtlas(
      this.renderTargets.map((renderTarget) => renderTarget.texture),
    );
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
}
