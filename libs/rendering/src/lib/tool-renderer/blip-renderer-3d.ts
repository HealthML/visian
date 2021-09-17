import {
  MergeFunction,
  RenderedImage,
  ScreenAlignedQuad,
} from "@visian/rendering";
import { IBlipRenderer3D, IDocument, IImageLayer } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { action, makeObservable, observable, reaction } from "mobx";
import * as THREE from "three";

import { Blip3DMaterial } from "./utils/blip-material";

export const MAX_BLIP_STEPS = 254;

export class BlipRenderer3D implements IBlipRenderer3D, IDisposable {
  public readonly excludeFromSnapshotTracking = ["document"];

  public holdsPreview = false;
  public previewColor?: string;

  /** The number of blip steps to threshold to (when using the `BlipMaterial`'s `uRenderValue`). */
  public steps = MAX_BLIP_STEPS;

  /** The full number of blip steps to execute during render. */
  public maxSteps = MAX_BLIP_STEPS;

  protected disposers: IDisposer[] = [];

  protected renderTargets: THREE.WebGLRenderTarget[] = [];
  protected blipRenderTargets: THREE.WebGLRenderTarget[] = [];

  protected material: Blip3DMaterial;
  protected quad: ScreenAlignedQuad;

  constructor(
    private document: IDocument,
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

    makeObservable(this, {
      holdsPreview: observable,
      maxSteps: observable,
      previewColor: observable,
      steps: observable,

      setPreviewColor: action,
      setMaxSteps: action,
      setSteps: action,
      render: action,
      flushToAnnotation: action,
      discard: action,
    });
  }

  public setPreviewColor = (value: string) => {
    this.previewColor = value;
  };

  public setMaxSteps = (value: number) => {
    this.maxSteps = value;
    this.steps = Math.min(this.steps, value);
  };

  public render(initialAnnotation?: IImageLayer) {
    const sourceImage = (this.document.layers.find(
      (layer) =>
        layer.kind === "image" && !layer.isAnnotation && layer.isVisible,
    ) as IImageLayer | undefined)?.image as RenderedImage | undefined;
    if (!sourceImage) return;

    this.material.setAtlasGrid(sourceImage.getAtlasGrid().toArray());
    this.material.setVoxelCount(sourceImage.voxelCount.toArray());

    this.steps = this.maxSteps;
    const blipSteps = Math.ceil(
      Math.min(this.maxSteps, sourceImage.voxelCount.sum()) / 2,
    );
    const useOddOutput = Boolean(this.steps % 2);

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      this.material.setSourceTexture(sourceImage.getTexture(rendererIndex));

      renderer.autoClear = false;

      for (let i = 0; i < blipSteps; i++) {
        if (!i && initialAnnotation) {
          this.material.setTargetTexture(
            (initialAnnotation.image as RenderedImage).getTexture(
              rendererIndex,
            ),
          );
        } else {
          this.material.setTargetTexture(
            this.renderTargets[rendererIndex].texture,
          );
        }
        this.material.setStep(2 * i);
        // TODO: This approach causes WebGL warnings, but seems to work
        renderer.setRenderTarget(
          i === blipSteps - 1 && useOddOutput
            ? this.renderTargets[rendererIndex]
            : this.blipRenderTargets[rendererIndex],
        );
        this.quad.renderWith(renderer);

        if (!(i === blipSteps - 1 && useOddOutput)) {
          this.material.setTargetTexture(
            this.blipRenderTargets[rendererIndex].texture,
          );
          this.material.setStep(2 * i + 1);
          renderer.setRenderTarget(this.renderTargets[rendererIndex]);
          this.quad.renderWith(renderer);
        }
      }

      renderer.setRenderTarget(null);
      renderer.autoClear = true;
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

    this.discard();
  }

  public discard() {
    if (!this.holdsPreview) return;

    this.clearRenderTargets();
    this.holdsPreview = false;

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public get outputTextures() {
    return this.renderTargets.map((renderTarget) => renderTarget.texture);
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
