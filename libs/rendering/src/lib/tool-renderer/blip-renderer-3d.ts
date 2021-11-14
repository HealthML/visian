import { Texture3DRenderer } from "@visian/rendering";
import {
  IBlipRenderer3D,
  IDocument,
  IImageLayer,
  MergeFunction,
} from "@visian/ui-shared";
import {
  getPlaneAxes,
  IDisposable,
  IDisposer,
  Vector,
  ViewType,
} from "@visian/utils";
import { action, makeObservable, observable, reaction } from "mobx";
import * as THREE from "three";

import { ImageRenderTarget, RenderedImage } from "../rendered-image";
import { Blip3DMaterial, MAX_BLIP_STEPS } from "./utils";

export class BlipRenderer3D implements IBlipRenderer3D, IDisposable {
  public readonly excludeFromSnapshotTracking = ["document"];

  public holdsPreview = false;
  public previewColor?: string;

  /** The number of blip steps to threshold to (when using the `BlipMaterial`'s `uRenderValue`). */
  public steps = MAX_BLIP_STEPS;

  /** The full number of blip steps to execute during render. */
  public maxSteps = MAX_BLIP_STEPS;

  protected disposers: IDisposer[] = [];

  protected hasOddOutput = false;
  protected renderTarget!: THREE.WebGLRenderTarget;
  protected blipRenderTarget!: THREE.WebGLRenderTarget;

  protected material: Blip3DMaterial;
  protected texture3DRenderer: Texture3DRenderer;

  constructor(
    protected document: IDocument,
    parameters?: THREE.ShaderMaterialParameters,
  ) {
    this.material = new Blip3DMaterial(document, parameters);
    this.texture3DRenderer = new Texture3DRenderer();

    this.disposers.push(
      reaction(
        () => Boolean(document.baseImageLayer?.is3DLayer),
        (is3D) => {
          const imageProperties = {
            voxelCount: new Vector([1, 1, 1]),
            is3D,
            defaultViewType: ViewType.Transverse,
          };
          this.renderTarget = new ImageRenderTarget(
            imageProperties,
            THREE.NearestFilter,
          );
          this.blipRenderTarget = new ImageRenderTarget(
            imageProperties,
            THREE.NearestFilter,
          );
          this.resizeRenderTargets();
        },
        { fireImmediately: true },
      ),
      reaction(
        () => [
          document.baseImageLayer?.image.voxelCount.toArray(),
          document.baseImageLayer?.image.defaultViewType,
        ],
        this.resizeRenderTargets,
      ),
    );

    makeObservable<this, "hasOddOutput">(this, {
      holdsPreview: observable,
      maxSteps: observable,
      previewColor: observable,
      steps: observable,
      hasOddOutput: observable,

      setPreviewColor: action,
      setMaxSteps: action,
      setSteps: action,
      render: action,
      flushToAnnotation: action,
      discard: action,
    });
  }

  public get sourceLayer(): IImageLayer | undefined {
    return this.document.layers.find(
      (layer) =>
        layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
    ) as IImageLayer | undefined;
  }

  public setPreviewColor = (value: string) => {
    this.previewColor = value;
  };

  public setMaxSteps = (value: number) => {
    this.maxSteps = value;
    this.steps = Math.min(this.steps, value);
  };

  /**
   * Runs the multi-step blip rendering.
   *
   * @param initialTarget The initial target annotation (if any). This can be
   * used to evolve an existing annotation instead of generating one from
   * scratch based on just the source image.
   */
  public render(
    initialTarget?: IImageLayer,
    getIntervalFromStep?: (step: number) => [number, number],
  ) {
    if (!this.document.renderer) return;

    const sourceImage = this.sourceLayer?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    this.steps = this.maxSteps;
    const blipSteps = Math.min(this.maxSteps, sourceImage.voxelCount.sum());

    const hasOddInput = this.hasOddOutput;
    if (this.steps % 2) {
      this.hasOddOutput = !this.hasOddOutput;
    }

    this.texture3DRenderer.setMaterial(this.material);

    this.material.setSourceTexture(sourceImage.getTexture());

    for (let i = 0; i < blipSteps; i++) {
      const isOdd = i % 2 ? hasOddInput : !hasOddInput;

      if (!i && initialTarget) {
        this.material.setTargetTexture(
          (initialTarget.image as RenderedImage).getTexture(),
        );
      } else {
        this.material.setTargetTexture(
          isOdd ? this.renderTarget.texture : this.blipRenderTarget.texture,
        );
      }
      this.material.setStep(i);
      this.texture3DRenderer.setTarget(
        isOdd ? this.blipRenderTarget : this.renderTarget,
      );

      this.texture3DRenderer.render(
        this.document.renderer,
        getIntervalFromStep?.(i),
        false,
      );
    }

    this.holdsPreview = true;

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public setSteps = (value: number) => {
    this.steps = Math.min(value, this.maxSteps);
  };

  public flushToAnnotation(
    layer = this.document.activeLayer as IImageLayer,
    shouldReplace = false,
  ) {
    if (layer.kind !== "image" || !layer.isAnnotation) {
      return;
    }

    const annotation = layer.image as RenderedImage;

    if (shouldReplace) {
      annotation.writeToTexture(this.outputTexture, MergeFunction.Replace);
    } else {
      annotation.writeToTexture(
        this.outputTexture,
        MergeFunction.Add,
        this.steps !== undefined
          ? (this.maxSteps + 1 - this.steps) / (this.maxSteps + 1)
          : this.steps,
      );
    }

    this.discard();
  }

  public discard() {
    if (!this.holdsPreview) return;

    this.clearRenderTargets();
    this.holdsPreview = false;
    this.hasOddOutput = false;

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public get outputTexture() {
    return (this.hasOddOutput ? this.blipRenderTarget : this.renderTarget)
      .texture;
  }

  protected resizeRenderTargets = () => {
    const { baseImageLayer } = this.document;
    if (!baseImageLayer) return;

    const { voxelCount } = baseImageLayer.image;

    let width = 0;
    let height = 0;
    let depth = 1;
    if (baseImageLayer.is3DLayer) {
      width = voxelCount.x;
      height = voxelCount.y;
      depth = voxelCount.z;
    } else {
      [width, height] = getPlaneAxes(baseImageLayer.image.defaultViewType).map(
        (axis) => voxelCount[axis],
      );
    }

    [this.renderTarget, this.blipRenderTarget].forEach((renderTarget) => {
      renderTarget?.setSize(width, height, depth);
    });
  };

  protected clearRenderTargets() {
    if (!this.document.renderer) return;

    this.texture3DRenderer.setTarget(this.renderTarget);
    this.texture3DRenderer.clear(this.document.renderer);
    this.texture3DRenderer.setTarget(this.blipRenderTarget);
    this.texture3DRenderer.clear(this.document.renderer);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.material.dispose();
    this.texture3DRenderer.dispose();
    [this.renderTarget, this.blipRenderTarget].forEach((renderTarget) =>
      renderTarget?.dispose(),
    );
  }
}
