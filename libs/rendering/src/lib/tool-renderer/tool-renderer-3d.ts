import {
  IDocument,
  IImageLayer,
  IToolRenderer3D,
  MergeFunction,
} from "@visian/ui-shared";
import {
  getPlaneAxes,
  IDisposable,
  IDisposer,
  Vector,
  ViewType,
} from "@visian/utils";
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import * as THREE from "three";

import { ImageRenderTarget, RenderedImage } from "../rendered-image";
import { Texture3DMaterial, Texture3DRenderer } from "../texture-3d-renderer";

export class ToolRenderer3D implements IToolRenderer3D, IDisposable {
  public readonly excludeFromSnapshotTracking = ["document"];

  public holdsPreview = false;
  public previewColor?: string;

  protected disposers: IDisposer[] = [];

  protected renderTarget!: THREE.WebGLRenderTarget;

  protected material: Texture3DMaterial;
  protected texture3DRenderer: Texture3DRenderer;

  constructor(
    protected document: IDocument,
    parameters?: THREE.ShaderMaterialParameters,
  ) {
    this.material = new Texture3DMaterial(parameters);
    this.texture3DRenderer = new Texture3DRenderer();

    makeObservable<this, "renderTarget">(this, {
      holdsPreview: observable,
      previewColor: observable,
      renderTarget: observable,

      outputTexture: computed,

      setPreviewColor: action,
      render: action,
      flushToAnnotation: action,
      discard: action,
    });

    this.disposers.push(
      reaction(
        () => Boolean(document.mainImageLayer?.is3DLayer),
        (is3D) =>
          runInAction(() => {
            this.initializeRenderTarget(is3D);
            this.resizeRenderTarget();
          }),
        { fireImmediately: true },
      ),
      reaction(
        () => [
          document.mainImageLayer?.image.voxelCount.toArray(),
          document.mainImageLayer?.image.defaultViewType,
        ],
        this.resizeRenderTarget,
      ),
    );
  }

  public setPreviewColor = (value: string) => {
    this.previewColor = value;
  };

  public get sourceLayer(): IImageLayer | undefined {
    return this.document.layers.find(
      (layer) =>
        layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
    ) as IImageLayer | undefined;
  }

  protected initializeRenderTarget(is3D: boolean) {
    const imageProperties = {
      voxelCount: new Vector([1, 1, 1]),
      is3D,
      defaultViewType: ViewType.Transverse,
    };
    this.renderTarget = new ImageRenderTarget(
      imageProperties,
      THREE.NearestFilter,
    ).target;
  }

  public render() {
    if (!this.document.renderer) return;

    this.texture3DRenderer.setMaterial(this.material);
    this.texture3DRenderer.setTarget(this.renderTarget);
    this.texture3DRenderer.render(this.document.renderer, undefined, false);

    this.holdsPreview = true;

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public flushToAnnotation(
    layer = this.document.activeLayer as IImageLayer,
    shouldReplace = false,
  ) {
    if (
      layer.kind !== "image" ||
      !layer.isAnnotation ||
      !this.document.renderer
    ) {
      return;
    }

    const annotation = layer.image as RenderedImage;

    const isXREnabled = this.document.renderer.xr.enabled;
    this.document.renderer.xr.enabled = false;
    if (shouldReplace) {
      annotation.writeToTexture(this.outputTexture, MergeFunction.Replace);
    } else {
      annotation.writeToTexture(this.outputTexture, MergeFunction.Add);
    }
    this.document.renderer.xr.enabled = isXREnabled;

    this.discard();
  }

  public discard() {
    if (!this.holdsPreview) return;

    this.clearRenderTarget();
    this.holdsPreview = false;

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public get outputTexture() {
    return this.renderTarget.texture;
  }

  protected resizeRenderTarget = () => {
    const { mainImageLayer } = this.document;
    if (!mainImageLayer) return;

    const { voxelCount } = mainImageLayer.image;

    let width = 0;
    let height = 0;
    let depth = 1;
    if (mainImageLayer.is3DLayer) {
      width = voxelCount.x;
      height = voxelCount.y;
      depth = voxelCount.z;
    } else {
      [width, height] = getPlaneAxes(mainImageLayer.image.defaultViewType).map(
        (axis) => voxelCount[axis],
      );
    }

    this.renderTarget.setSize(width, height, depth);
  };

  protected clearRenderTarget() {
    if (!this.document.renderer) return;

    this.texture3DRenderer.setTarget(this.renderTarget);
    this.texture3DRenderer.clear(this.document.renderer);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.material.dispose();
    this.texture3DRenderer.dispose();
    this.renderTarget?.dispose();
  }
}
