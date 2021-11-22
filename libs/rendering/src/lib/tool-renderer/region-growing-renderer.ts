import * as THREE from "three";
import { IDocument, IImageLayer } from "@visian/ui-shared";
import { getOrthogonalAxis, getPlaneAxes } from "@visian/utils";
import { reaction } from "mobx";
import { RenderedImage } from "../rendered-image";
import { ToolRenderer } from "./tool-renderer";
import { Circle, RegionGrowingMaterial } from "./utils";
import { ScreenAlignedQuad } from "../screen-aligned-quad";

export class RegionGrowingRenderer extends ToolRenderer {
  protected blipRenderTarget = new THREE.WebGLRenderTarget(1, 1);
  protected dataSourceRenderTarget = new THREE.WebGLRenderTarget(1, 1);

  protected isDataSourceDirty = true;

  protected regionGrowingMaterial: RegionGrowingMaterial;
  protected regionGrowingQuad: ScreenAlignedQuad;

  protected lastCircle?: Circle;

  constructor(document: IDocument) {
    super(document);

    this.regionGrowingMaterial = new RegionGrowingMaterial();
    this.regionGrowingQuad = new ScreenAlignedQuad(this.regionGrowingMaterial);

    this.resizeRenderTarget();

    this.disposers.push(
      reaction(
        () => [
          this.document.viewport2D.mainViewType,
          this.document.viewSettings.selectedVoxel.getFromView(
            this.document.viewport2D.mainViewType,
          ),
          this.document.imageLayers.find(
            (layer) => !layer.isAnnotation && layer.isVisible,
          )?.id,
        ],
        () => {
          this.isDataSourceDirty = true;
        },
      ),
    );
  }

  public dispose() {
    super.dispose();

    this.regionGrowingMaterial.dispose();
    this.regionGrowingQuad.dispose();
  }

  public doRegionGrowing(
    threshold: number,
    boundingRadius?: number,
    flush = true,
  ) {
    if (!this.lastCircle || !this.document.renderer) return;

    const annotation = (this.document.activeLayer as IImageLayer | undefined)
      ?.image as RenderedImage | undefined;

    if (!annotation) return;

    const sourceImage = (this.document.imageLayers.find(
      (layer) => !layer.isAnnotation && layer.isVisible,
    ) as IImageLayer | undefined)?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    const slice = this.document.viewSettings.selectedVoxel.getFromView(
      this.document.viewport2D.mainViewType,
    );

    if (this.isDataSourceDirty) {
      sourceImage.readSliceToTarget(
        slice,
        this.document.viewport2D.mainViewType,
        this.dataSourceRenderTarget,
      );

      this.isDataSourceDirty = false;
    }

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.document.viewport2D.mainViewType,
    );
    const width = annotation.voxelCount[widthAxis];
    const height = annotation.voxelCount[heightAxis];
    this.regionGrowingMaterial.setRegionSize(width, height);

    const depthAxis = getOrthogonalAxis(this.document.viewport2D.mainViewType);

    const seed = sourceImage.getVoxelData({
      [depthAxis]: slice,
      [widthAxis]: this.lastCircle.x,
      [heightAxis]: this.lastCircle.y,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any).x;

    this.regionGrowingMaterial.setSeed(seed);
    this.regionGrowingMaterial.setThreshold(threshold);

    const targetX = (this.lastCircle.x + 0.5) / width;
    const targetY = (this.lastCircle.y + 0.5) / height;
    const minUV =
      boundingRadius !== undefined
        ? [targetX - boundingRadius / width, targetY - boundingRadius / height]
        : undefined;
    const maxUV =
      boundingRadius !== undefined
        ? [targetX + boundingRadius / width, targetY + boundingRadius / height]
        : undefined;
    this.regionGrowingMaterial.setUVBounds(minUV, maxUV);

    this.lastCircle = undefined;

    const blipSteps = (boundingRadius ?? width + height) / 2;

    this.regionGrowingMaterial.setDataTexture(
      this.dataSourceRenderTarget.texture,
    );

    this.document.renderer.autoClear = false;

    for (let i = 0; i < blipSteps; i++) {
      this.regionGrowingMaterial.setRegionTexture(this.renderTarget.texture);
      this.document.renderer.setRenderTarget(this.blipRenderTarget);
      this.regionGrowingQuad.renderWith(this.document.renderer);

      this.regionGrowingMaterial.setRegionTexture(
        this.blipRenderTarget.texture,
      );
      this.document.renderer.setRenderTarget(this.renderTarget);
      this.regionGrowingQuad.renderWith(this.document.renderer);
    }

    this.document.renderer.setRenderTarget(null);
    this.document.renderer.autoClear = true;

    if (flush) this.flushToAnnotation(annotation);
  }

  public endStroke() {
    super.endStroke();

    if (!this.document.renderer) return;

    this.document.renderer.setRenderTarget(this.blipRenderTarget);
    this.document.renderer.clear();
    this.document.renderer.setRenderTarget(null);
  }

  public renderCircles(isAdditiveStroke: boolean, ...circles: Circle[]) {
    if (circles.length) {
      this.lastCircle = circles[circles.length - 1];
    }

    super.renderCircles(isAdditiveStroke, ...circles);
  }

  protected setRenderTargetSize(width: number, height: number) {
    super.setRenderTargetSize(width, height);

    this.blipRenderTarget?.setSize(width, height);
    this.dataSourceRenderTarget?.setSize(width, height);
  }
}
