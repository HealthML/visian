import { IBlipRenderer3D, IDocument, IImageLayer } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { action, makeObservable, observable, reaction } from "mobx";
import * as THREE from "three";

import { MergeFunction, RenderedImage } from "../rendered-image";
import ScreenAlignedQuad from "../screen-aligned-quad";
import { Blip3DMaterial, MAX_BLIP_STEPS } from "./utils/blip-material";

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
  protected renderTargets: THREE.WebGLRenderTarget[] = [];
  protected blipRenderTargets: THREE.WebGLRenderTarget[] = [];

  protected material: Blip3DMaterial;
  protected quad: ScreenAlignedQuad;

  constructor(
    protected document: IDocument,
    parameters?: THREE.ShaderMaterialParameters,
  ) {
    this.material = new Blip3DMaterial(parameters);
    this.quad = new ScreenAlignedQuad(this.material);

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

            renderers.forEach((renderer) => {
              this.quad.compileWith(renderer);
            });
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
  public render(initialTarget?: IImageLayer) {
    const sourceImage = this.sourceLayer?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    this.material.setAtlasGrid(sourceImage.getAtlasGrid().toArray());
    this.material.setVoxelCount(sourceImage.voxelCount.toArray());

    this.steps = this.maxSteps;
    const blipSteps = Math.min(this.maxSteps, sourceImage.voxelCount.sum());

    const hasOddInput = this.hasOddOutput;
    if (this.steps % 2) {
      this.hasOddOutput = !this.hasOddOutput;
    }

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      this.material.setSourceTexture(sourceImage.getTexture(rendererIndex));

      const isXREnabled = renderer.xr.enabled;
      renderer.xr.enabled = false;
      renderer.autoClear = false;

      for (let i = 0; i < blipSteps; i++) {
        const isOdd = i % 2 ? hasOddInput : !hasOddInput;

        if (!i && initialTarget) {
          this.material.setTargetTexture(
            (initialTarget.image as RenderedImage).getTexture(rendererIndex),
          );
        } else {
          this.material.setTargetTexture(
            isOdd
              ? this.renderTargets[rendererIndex].texture
              : this.blipRenderTargets[rendererIndex].texture,
          );
        }
        this.material.setStep(i);
        renderer.setRenderTarget(
          isOdd
            ? this.blipRenderTargets[rendererIndex]
            : this.renderTargets[rendererIndex],
        );
        this.quad.renderWith(renderer);
      }

      renderer.setRenderTarget(null);
      renderer.autoClear = true;
      renderer.xr.enabled = isXREnabled;
    });

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

    const isXREnabled = this.document.renderers?.map(
      (renderer) => renderer.xr.enabled,
    );
    this.document.renderers?.forEach((renderer) => {
      renderer.xr.enabled = false;
    });
    if (shouldReplace) {
      annotation.writeToAtlas(this.outputTextures, MergeFunction.Replace);
    } else {
      annotation.writeToAtlas(
        this.outputTextures,
        MergeFunction.Add,
        this.steps !== undefined
          ? (this.maxSteps + 1 - this.steps) / (this.maxSteps + 1)
          : this.steps,
      );
    }
    this.document.renderers?.forEach((renderer, index) => {
      renderer.xr.enabled = isXREnabled?.[index] || false;
    });

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

  public get outputTextures() {
    return (this.hasOddOutput
      ? this.blipRenderTargets
      : this.renderTargets
    ).map((renderTarget) => renderTarget.texture);
  }

  protected resizeRenderTargets = () => {
    if (!this.document.baseImageLayer) return;

    const [
      width,
      height,
    ] = this.document.baseImageLayer.image.getAtlasSize().toArray();

    [...this.renderTargets, ...this.blipRenderTargets].forEach(
      (renderTarget) => {
        renderTarget.setSize(width, height);
      },
    );
  };

  protected clearRenderTargets() {
    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(this.blipRenderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(null);
    });
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.material.dispose();
    this.quad.dispose();
    [...this.renderTargets, ...this.blipRenderTargets].forEach((rendertarget) =>
      rendertarget.dispose(),
    );
  }
}
