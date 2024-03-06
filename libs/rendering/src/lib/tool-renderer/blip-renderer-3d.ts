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
import { action, makeObservable, observable } from "mobx";
import * as THREE from "three";

import { ToolRenderer3D } from "./tool-renderer-3d";
import { Blip3DMaterial, MAX_BLIP_STEPS } from "./utils";
import { ImageRenderTarget, RenderedImage } from "../rendered-image";

export class BlipRenderer3D
  extends ToolRenderer3D
  implements IBlipRenderer3D, IDisposable
{
  public readonly excludeFromSnapshotTracking = ["document"];

  /** The number of blip steps to threshold to (when using the `BlipMaterial`'s `uRenderValue`). */
  public steps = MAX_BLIP_STEPS;

  /** The full number of blip steps to execute during render. */
  public maxSteps = MAX_BLIP_STEPS;

  protected disposers: IDisposer[] = [];

  protected hasOddOutput = false;
  protected blipRenderTarget!: THREE.WebGLRenderTarget;
  protected material: Blip3DMaterial;

  constructor(
    protected document: IDocument,
    parameters?: THREE.ShaderMaterialParameters,
  ) {
    super(document, parameters);

    this.material = new Blip3DMaterial(document, parameters);

    makeObservable<this, "hasOddOutput" | "blipRenderTarget">(this, {
      maxSteps: observable,
      steps: observable,
      hasOddOutput: observable,
      blipRenderTarget: observable,

      setMaxSteps: action,
      setSteps: action,
    });
  }

  public get sourceLayer(): IImageLayer | undefined {
    return this.document.layers.find(
      (layer) =>
        layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
    ) as IImageLayer | undefined;
  }

  public setMaxSteps = (value: number) => {
    this.maxSteps = value;
    this.steps = Math.min(this.steps, value);
  };

  protected initializeRenderTarget(is3D: boolean) {
    super.initializeRenderTarget(is3D);

    const imageProperties = {
      voxelCount: new Vector([1, 1, 1]),
      is3D,
      defaultViewType: ViewType.Transverse,
    };
    this.blipRenderTarget = new ImageRenderTarget(
      imageProperties,
      THREE.NearestFilter,
    ).target;
  }

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
      annotation.writeToTexture(
        this.outputTexture,
        MergeFunction.Add,
        this.steps !== undefined
          ? (this.maxSteps + 1 - this.steps) / (this.maxSteps + 1)
          : this.steps,
      );
    }
    this.document.renderer.xr.enabled = isXREnabled;

    this.discard();
  }

  public get outputTexture() {
    return (this.hasOddOutput ? this.blipRenderTarget : this.renderTarget)
      .texture;
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

    [this.renderTarget, this.blipRenderTarget].forEach((renderTarget) => {
      renderTarget?.setSize(width, height, depth);
    });
  };

  protected clearRenderTarget() {
    super.clearRenderTarget();

    if (!this.document.renderer) return;

    this.texture3DRenderer.setTarget(this.blipRenderTarget);
    this.texture3DRenderer.clear(this.document.renderer);
  }

  public dispose() {
    super.dispose();
    this.blipRenderTarget?.dispose();
  }
}
