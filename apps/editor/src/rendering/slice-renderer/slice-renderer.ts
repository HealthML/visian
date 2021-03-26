import { IDisposer, TextureAtlas } from "@visian/util";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import { reaction } from "mobx";
import * as THREE from "three";

import { Slice } from "./slice";
import { IDisposable, viewTypes } from "./types";
import {
  getOrder,
  getWebGLSize,
  resizeRenderer,
  setMainCameraPlanes,
} from "./utils";

import type { Editor } from "../../models";
import type { Image } from "../../models/editor/image";
export class SliceRenderer implements IDisposable {
  private renderers: THREE.WebGLRenderer[];
  private mainCamera: THREE.OrthographicCamera;
  private sideCamera: THREE.OrthographicCamera;
  private scenes = viewTypes.map(() => new THREE.Scene());

  private slices: Slice[];

  private lazyRenderTriggered = true;

  private isImageLoaded = false;

  private resizeSensors: ResizeSensor[] = [];

  private disposers: IDisposer[] = [];

  constructor(
    private mainCanvas: HTMLCanvasElement,
    private upperSideCanvas: HTMLCanvasElement,
    private lowerSideCanvas: HTMLCanvasElement,
    private editor: Editor,
  ) {
    this.renderers = this.canvases.map(
      (canvas) =>
        new THREE.WebGLRenderer({
          alpha: true,
          canvas,
        }),
    );

    const aspect = mainCanvas.clientWidth / mainCanvas.clientHeight;
    this.mainCamera = new THREE.OrthographicCamera(
      -aspect,
      aspect,
      1,
      -1,
      0,
      20,
    );
    this.sideCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 20);

    this.slices = viewTypes.map(
      (viewType) => new Slice(editor, viewType, this.lazyRender),
    );
    this.slices.forEach((slice, viewType) => this.scenes[viewType].add(slice));

    window.addEventListener("resize", this.resize);
    this.resize();

    mainCanvas.addEventListener("wheel", this.handleWheel);

    this.resizeSensors.push(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      new ResizeSensor(this.upperSideCanvas.parentElement!, () =>
        resizeRenderer(this.renderers[1], this.eagerRender),
      ),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      new ResizeSensor(this.lowerSideCanvas.parentElement!, () =>
        resizeRenderer(this.renderers[2], this.eagerRender),
      ),
    );

    this.disposers.push(
      reaction(
        () => editor.image,
        (image?: Image) => {
          if (image) {
            this.setImage(
              new TextureAtlas(
                new THREE.Vector3().fromArray(image.voxelCount),
                new THREE.Vector3().fromArray(image.voxelSpacing),
                THREE.NearestFilter,
              ).setData(image.data),
            );
          }
        },
        { fireImmediately: true },
      ),
    );

    this.renderers[0].setAnimationLoop(this.animate);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.slices.forEach((slice) => slice.dispose());
    window.removeEventListener("resize", this.resize);
    this.resizeSensors.forEach((sensor) => sensor.detach());
    this.mainCanvas.removeEventListener("wheel", this.handleWheel);
  }

  private resize = () => {
    this.renderers[0].setSize(window.innerWidth, window.innerHeight);

    setMainCameraPlanes(this.editor, this.mainCanvas, this.mainCamera);

    this.eagerRender();
  };

  private animate = () => {
    if (this.lazyRenderTriggered) {
      this.eagerRender();
    }
  };

  public lazyRender = () => {
    this.lazyRenderTriggered = true;
  };

  public getMainViewWebGLSize() {
    return getWebGLSize(this.mainCamera);
  }

  /** Converts a WebGL position to a screen space one. */
  public getMainViewScreenPosition(webGLPosition: { x: number; y: number }) {
    const boundingBox = this.mainCanvas.getBoundingClientRect();
    const webGLSize = this.getMainViewWebGLSize();
    return {
      x:
        ((webGLPosition.x - this.mainCamera.left) / webGLSize.x) *
          boundingBox.width +
        boundingBox.left,
      y:
        ((webGLPosition.y - this.mainCamera.top) / -webGLSize.y) *
          boundingBox.height +
        boundingBox.top,
    };
  }

  /** Converts a screen space position to a WebGL one. */
  public getMainViewWebGLPosition(screenPosition: { x: number; y: number }) {
    const boundingBox = this.mainCanvas.getBoundingClientRect();
    const webGLSize = this.getMainViewWebGLSize();
    return {
      x:
        ((screenPosition.x - boundingBox.left) / boundingBox.width) *
          webGLSize.x +
        this.mainCamera.left,
      y:
        ((screenPosition.y - boundingBox.top) / boundingBox.height) *
          -webGLSize.y +
        this.mainCamera.top,
    };
  }

  private get canvases() {
    return [this.mainCanvas, this.upperSideCanvas, this.lowerSideCanvas];
  }

  private get activeRenderers() {
    return this.editor.viewSettings.shouldShowSideViews
      ? this.renderers
      : [this.renderers[0]];
  }

  private eagerRender = () => {
    if (!this.isImageLoaded) return;
    this.lazyRenderTriggered = false;

    const order = getOrder(this.editor.viewSettings.mainViewType);
    this.activeRenderers.forEach((renderer, index) => {
      const viewType = order[index];
      const camera = index ? this.sideCamera : this.mainCamera;
      renderer.render(this.scenes[viewType], camera);
    });
  };

  // TODO: Move this to event handling.
  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (event.ctrlKey) {
      if (event.deltaY > 0) {
        this.editor.viewSettings.zoomOut();
      } else if (event.deltaY < 0) {
        this.editor.viewSettings.zoomIn();
      }
    } else {
      this.editor.viewSettings.stepSelectedSlice(-Math.sign(event.deltaY));
    }
  };

  public setImage(atlas: TextureAtlas) {
    this.slices.forEach((slice) => slice.setAtlas(atlas));
    this.isImageLoaded = true;

    this.lazyRender();
  }
}

export default SliceRenderer;
