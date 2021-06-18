import * as THREE from "three";
import { IDocument, IImageLayer } from "@visian/ui-shared";
import { getOrthogonalAxis, getPlaneAxes } from "@visian/utils";
import { reaction } from "mobx";
import { MergeFunction, RenderedImage } from "../rendered-image";
import { ToolRenderer } from "./tool-renderer";
import { Circle } from "./utils";
import { RegionGrowingMaterial } from "./utils/region-growing-material";
import ScreenAlignedQuad from "../screen-aligned-quad";

export class RegionGrowingRenderer extends ToolRenderer {
  protected isCurrentStrokePositive = true;

  protected blipRenderTargets: THREE.WebGLRenderTarget[] = [];
  protected dataSourceRenderTargets: THREE.WebGLRenderTarget[] = [];

  protected isDataSourceDirty = true;

  protected regionGrowingMaterial: RegionGrowingMaterial;
  protected regionGrowingQuad: ScreenAlignedQuad;

  protected lastCircle?: Circle;

  constructor(document: IDocument) {
    super(document);

    this.regionGrowingMaterial = new RegionGrowingMaterial();
    this.regionGrowingQuad = new ScreenAlignedQuad(this.regionGrowingMaterial);

    this.disposers.push(
      reaction(
        () => document.renderers,
        (renderers) => {
          if (renderers) {
            this.blipRenderTargets = renderers.map(
              () => new THREE.WebGLRenderTarget(1, 1),
            );
            this.dataSourceRenderTargets = renderers.map(
              () => new THREE.WebGLRenderTarget(1, 1),
            );
            this.resizeRenderTargets();
            this.handleCurrentSliceChanged();
          }
        },
        { fireImmediately: true },
      ),
      reaction(
        () => [
          this.document.viewport2D.mainViewType,
          this.document.viewSettings.selectedVoxel.getFromView(
            this.document.viewport2D.mainViewType,
          ),
          this.document.layers.find(
            (layer) =>
              layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
          )?.id,
        ],
        () => {
          this.isDataSourceDirty = true;
        },
      ),
    );
  }

  public doRegionGrowing(threshold: number) {
    if (!this.lastCircle) return;

    const annotation = (this.document.activeLayer as IImageLayer | undefined)
      ?.image as RenderedImage | undefined;

    if (!annotation) return;

    const sourceImage = (this.document.layers.find(
      (layer) =>
        layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
    ) as IImageLayer | undefined)?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    const slice = this.document.viewSettings.selectedVoxel.getFromView(
      this.document.viewport2D.mainViewType,
    );

    if (this.isDataSourceDirty) {
      this.dataSourceRenderTargets.forEach((renderTarget, renderIndex) => {
        sourceImage.readSliceToTarget(
          slice,
          this.document.viewport2D.mainViewType,
          renderIndex,
          renderTarget,
        );
      });

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
    } as any);
    this.lastCircle = undefined;

    this.regionGrowingMaterial.setSeed(seed);
    this.regionGrowingMaterial.setThreshold(threshold);

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      this.regionGrowingMaterial.setDataTexture(
        this.dataSourceRenderTargets[rendererIndex].texture,
      );

      renderer.autoClear = false;

      for (let i = 0; i < (width + height) / 2; i++) {
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

    this.flushToAnnotation(annotation);

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(this.blipRenderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(null);
    });
  }

  protected flushToAnnotation(annotation: RenderedImage) {
    const viewType = this.document.viewport2D.mainViewType;
    const orthogonalAxis = getOrthogonalAxis(viewType);
    annotation.setSlice(
      viewType,
      this.document.viewSettings.selectedVoxel[orthogonalAxis],
      this.textures,
      this.isCurrentStrokePositive ? MergeFunction.Add : MergeFunction.Subtract,
    );
  }

  protected updateCircles() {
    this.circles.setCircles(this.circlesToRender, 255);
  }

  public renderCircles(...circles: Circle[]) {
    if (circles.length) {
      this.isCurrentStrokePositive = Boolean(circles[0].value);

      this.lastCircle = circles[circles.length - 1];
    }

    super.renderCircles(...circles);
  }

  public handleCurrentSliceChanged = () => {
    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(null);
    });
  };

  protected setRenderTargetSize(width: number, height: number) {
    super.setRenderTargetSize(width, height);

    this.blipRenderTargets?.forEach((renderTarget) => {
      renderTarget.setSize(width, height);
    });
    this.dataSourceRenderTargets?.forEach((renderTarget) => {
      renderTarget.setSize(width, height);
    });
  }
}
