import { IDocument, IImageLayer } from "@visian/ui-shared";
import { getOrthogonalAxis, getPlaneAxes, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";
import { RenderedImage } from "../rendered-image";

import { Circles } from "./circles";
import { ToolCamera } from "./tool-camera";
import { Circle } from "./types";

export class ToolRenderer {
  private circlesToRender: Circle[] = [];
  private shapesToRender: THREE.Mesh[] = [];

  private camera: ToolCamera;
  private shapeScene = new THREE.Scene();

  private circles: Circles;
  private renderTargets: THREE.WebGLRenderTarget[] = [];

  private renderCallbacks: (() => void)[] = [];

  private disposers: IDisposer[] = [];

  constructor(private document: IDocument) {
    this.camera = new ToolCamera(document);
    this.circles = new Circles();

    this.disposers.push(
      reaction(
        () => ({
          mainViewType: document.viewport2D.mainViewType,
          selectedSlice: document.viewSettings.selectedVoxel.getFromView(
            document.viewport2D.mainViewType,
          ),
          annotation: document.layers.length
            ? ((document.layers[0] as IImageLayer).image as RenderedImage)
            : undefined,
        }),
        (params) => {
          if (!params.annotation) return;

          this.resizeRenderTargets();
          this.handleCurrentSliceChanged(params);
        },
        { fireImmediately: true },
      ),
      reaction(
        () => document.renderers,
        (renderers) => {
          if (renderers) {
            this.renderTargets = renderers.map(
              () => new THREE.WebGLRenderTarget(1, 1),
            );
            this.resizeRenderTargets();
            this.handleCurrentSliceChanged();
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

  /**
   * Needs to be called whenever the current slice of the active annotation is
   * changed by some other source than this tool renderer.
   */
  public handleCurrentSliceChanged = (
    { mainViewType, selectedSlice, annotation } = {
      mainViewType: this.document.viewport2D.mainViewType,
      selectedSlice: this.document.viewSettings.selectedVoxel.getFromView(
        this.document.viewport2D.mainViewType,
      ),
      annotation: this.document.layers.length
        ? ((this.document.layers[0] as IImageLayer).image as RenderedImage)
        : undefined,
    },
  ) => {
    if (!annotation) return;

    annotation.waitForRenderers().then(() => {
      this.renderTargets.forEach((renderTarget, index) => {
        annotation.readSliceToTarget(
          selectedSlice,
          mainViewType,
          index,
          renderTarget,
        );
      });
    });
  };

  public render() {
    const circles = this.circlesToRender.length;
    const shapes = this.shapesToRender.length;

    if (!circles && !shapes) return;

    const { renderers } = this.document;
    const annotation = (this.document.layers[0] as IImageLayer)
      .image as RenderedImage;
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

    const viewType = this.document.viewport2D.mainViewType;
    const orthogonalAxis = getOrthogonalAxis(viewType);
    annotation.setSlice(
      viewType,
      this.document.viewSettings.selectedVoxel[orthogonalAxis],
      this.textures,
    );

    this.renderCallbacks.forEach((callback) => callback());
    this.renderCallbacks = [];
  }

  public renderCircles(...circles: Circle[]) {
    this.circlesToRender.push(...circles);

    this.document.sliceRenderer?.lazyRender();
  }

  public renderShape(geometry: THREE.ShapeGeometry, material?: THREE.Material) {
    this.shapesToRender.push(
      new THREE.Mesh(geometry, material || new THREE.MeshBasicMaterial()),
    );

    this.document.sliceRenderer?.lazyRender();
  }

  public waitForRender() {
    if (!this.circlesToRender.length && !this.shapesToRender.length) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.renderCallbacks.push(resolve);
    });
  }

  private get textures() {
    return this.renderTargets.map((renderTarget) => renderTarget.texture);
  }

  private resizeRenderTargets = () => {
    if (!this.document.layers.length) return;

    const { voxelCount } = (this.document.layers[0] as IImageLayer).image;
    if (!voxelCount) return;

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.document.viewport2D.mainViewType,
    );

    const width = voxelCount[widthAxis];
    const height = voxelCount[heightAxis];

    this.renderTargets.forEach((renderTarget) => {
      renderTarget.setSize(width, height);
    });
  };
}
