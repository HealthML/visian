import { IDocument, IImageLayer, MergeFunction } from "@visian/ui-shared";
import { getOrthogonalAxis, getPlaneAxes, IDisposer } from "@visian/utils";
import { action, makeObservable, observable, reaction } from "mobx";
import * as THREE from "three";
import { RenderedImage } from "../rendered-image";

import { Circles, ToolCamera, Circle } from "./utils";

export class ToolRenderer {
  public readonly excludeFromSnapshotTracking = ["document"];

  public mergeFunction = MergeFunction.Add;

  protected circlesToRender: Circle[] = [];
  private shapesToRender: THREE.Mesh[] = [];

  private camera: ToolCamera;
  private shapeScene = new THREE.Scene();

  protected circles: Circles;
  protected renderTargets: THREE.WebGLRenderTarget[] = [];

  protected renderCallbacks: (() => void)[] = [];

  protected disposers: IDisposer[] = [];

  constructor(protected document: IDocument) {
    this.camera = new ToolCamera(document);
    this.circles = new Circles();

    makeObservable(this, {
      mergeFunction: observable,
      renderCircles: action,
      renderShape: action,
    });

    this.disposers.push(
      reaction(
        () => [
          document.viewport2D.mainViewType,
          document.viewSettings.selectedVoxel.getFromView(
            document.viewport2D.mainViewType,
          ),
          document.activeLayer
            ? ((document.activeLayer as IImageLayer).image as RenderedImage)
            : undefined,
        ],
        this.resizeRenderTargets,
        { fireImmediately: true },
      ),
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
            this.resizeRenderTargets();
          } else {
            this.renderTargets = [];
          }
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    this.circles.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  public endStroke() {
    if (this.document.activeLayer) {
      const annotation = (this.document.activeLayer as IImageLayer)
        .image as RenderedImage;
      this.flushToAnnotation(annotation);
    }

    this.document.renderers?.forEach((renderer, rendererIndex) => {
      renderer.setRenderTarget(this.renderTargets[rendererIndex]);
      renderer.clear();
      renderer.setRenderTarget(null);
    });
  }

  public render() {
    const circles = this.circlesToRender.length;
    const shapes = this.shapesToRender.length;

    if ((!circles && !shapes) || !this.document.activeLayer) return;

    const { renderers } = this.document;
    if (!renderers) return;

    if (circles) {
      this.circles.setCircles(this.circlesToRender);
      this.circlesToRender = [];
    }

    if (shapes) {
      this.shapeScene.remove(...this.shapeScene.children);
      this.shapeScene.add(...this.shapesToRender);
      this.shapesToRender = [];
    }

    renderers.forEach((renderer, index) => {
      renderer.setRenderTarget(this.renderTargets[index]);
      renderer.autoClear = false;

      if (circles) {
        renderer.render(this.circles, this.camera);
      }

      if (shapes) {
        renderer.render(this.shapeScene, this.camera);
      }

      renderer.autoClear = true;
      renderer.setRenderTarget(null);
    });

    this.renderCallbacks.forEach((callback) => callback());
    this.renderCallbacks = [];
  }

  protected flushToAnnotation(annotation: RenderedImage) {
    const viewType = this.document.viewport2D.mainViewType;
    const orthogonalAxis = getOrthogonalAxis(viewType);
    annotation.setSlice(
      viewType,
      this.document.viewSettings.selectedVoxel[orthogonalAxis],
      this.textures,
      this.mergeFunction,
    );
  }

  public renderCircles(isAdditiveStroke: boolean, ...circles: Circle[]) {
    this.mergeFunction = isAdditiveStroke
      ? MergeFunction.Add
      : MergeFunction.Subtract;

    this.circlesToRender.push(...circles);

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public renderShape(
    geometry: THREE.ShapeGeometry,
    material: THREE.Material,
    isAdditiveStroke: boolean,
  ) {
    this.mergeFunction = isAdditiveStroke
      ? MergeFunction.Add
      : MergeFunction.Subtract;

    this.shapesToRender.push(new THREE.Mesh(geometry, material));

    this.document.sliceRenderer?.lazyRender();
    this.document.volumeRenderer?.lazyRender(true);
  }

  public waitForRender() {
    if (!this.circlesToRender.length && !this.shapesToRender.length) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.renderCallbacks.push(resolve);
    });
  }

  public get textures() {
    return this.renderTargets.map((renderTarget) => renderTarget.texture);
  }

  protected resizeRenderTargets = () => {
    if (!this.document.activeLayer) return;

    const { voxelCount } = (this.document.activeLayer as IImageLayer).image;
    if (!voxelCount) return;

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.document.viewport2D.mainViewType,
    );

    const width = voxelCount[widthAxis];
    const height = voxelCount[heightAxis];

    this.setRenderTargetSize(width, height);
  };

  protected setRenderTargetSize(width: number, height: number) {
    this.renderTargets.forEach((renderTarget) => {
      renderTarget.setSize(width, height);
    });
  }
}
