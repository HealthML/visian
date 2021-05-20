import { getOrthogonalAxis, getPlaneAxes, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

import { Editor } from "../../../../models";
import { IRenderLoopSubscriber, SliceRenderer } from "../../../slice-renderer";
import { Circle } from "../../types";
import { Circles } from "./circles";
import { ToolCamera } from "./tool-camera";

export class ToolRenderer implements IRenderLoopSubscriber {
  private circlesToRender: Circle[] = [];
  private shapesToRender: THREE.Mesh[] = [];

  private camera: ToolCamera;
  private shapeScene = new THREE.Scene();

  private circles: Circles;
  private renderTargets: THREE.WebGLRenderTarget[] = [];

  private renderCallbacks: (() => void)[] = [];

  private disposers: IDisposer[] = [];

  constructor(private editor: Editor) {
    this.camera = new ToolCamera(editor);
    this.circles = new Circles();

    this.disposers.push(
      reaction(
        () => ({
          mainViewType: editor.viewSettings.mainViewType,
          selectedSlice: editor.viewSettings.selectedVoxel.getFromView(
            editor.viewSettings.mainViewType,
          ),
          annotation: editor.annotation,
        }),
        (params) => {
          this.resizeRenderTargets();
          this.currentSliceChanged(params);
        },
        { fireImmediately: true },
      ),
      reaction(
        () => editor.renderers,
        (renderers) => {
          if (renderers) {
            this.renderTargets = renderers.map(
              () => new THREE.WebGLRenderTarget(1, 1),
            );
            this.resizeRenderTargets();
            this.currentSliceChanged();
          } else {
            this.renderTargets = [];
          }
        },
        { fireImmediately: true },
      ),
      reaction(
        () => editor.sliceRenderer,
        (sliceRenderer?: SliceRenderer, oldSliceRenderer?: SliceRenderer) => {
          oldSliceRenderer?.unsubscribeFromRenderLoop(this);
          sliceRenderer?.subscribeToRenderLoop(this);
        },
      ),
    );
  }

  public dispose() {
    this.circles.dispose();
    this.editor.sliceRenderer?.unsubscribeFromRenderLoop(this);
    this.disposers.forEach((disposer) => disposer());
  }

  /**
   * Needs to be called whenever the current slice of the active annotation is
   * changed by some other source than this tool renderer.
   */
  public currentSliceChanged = (
    { mainViewType, selectedSlice, annotation } = {
      mainViewType: this.editor.viewSettings.mainViewType,
      selectedSlice: this.editor.viewSettings.selectedVoxel.getFromView(
        this.editor.viewSettings.mainViewType,
      ),
      annotation: this.editor.annotation,
    },
  ) => {
    if (!annotation) return;

    this.renderTargets.forEach((renderTarget, index) => {
      annotation.readSliceToTarget(
        selectedSlice,
        mainViewType,
        index,
        renderTarget,
      );
    });
  };

  public render() {
    const circles = this.circlesToRender.length;
    const shapes = this.shapesToRender.length;

    if (!circles && !shapes) return;

    const { renderers, annotation } = this.editor;
    if (!renderers || !annotation) return;

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

    const viewType = this.editor.viewSettings.mainViewType;
    const orthogonalAxis = getOrthogonalAxis(viewType);
    annotation.setSlice(
      viewType,
      this.editor.viewSettings.selectedVoxel[orthogonalAxis],
      this.textures,
    );

    this.renderCallbacks.forEach((callback) => callback());
    this.renderCallbacks = [];
  }

  public renderCircles(...circles: Circle[]) {
    this.circlesToRender.push(...circles);

    this.editor.sliceRenderer?.lazyRender();
  }

  public renderShape(geometry: THREE.ShapeGeometry, material?: THREE.Material) {
    this.shapesToRender.push(
      new THREE.Mesh(geometry, material || new THREE.MeshBasicMaterial()),
    );

    this.editor.sliceRenderer?.lazyRender();
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
    const { annotation } = this.editor;
    const voxelCount = annotation?.voxelCount;
    if (!voxelCount) return;

    const [widthAxis, heightAxis] = getPlaneAxes(
      this.editor.viewSettings.mainViewType,
    );

    const width = voxelCount[widthAxis];
    const height = voxelCount[heightAxis];

    this.renderTargets.forEach((renderTarget) => {
      renderTarget.setSize(width, height);
    });
  };
}
