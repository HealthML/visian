import {
  getPlaneAxes,
  IDisposable,
  IDisposer,
  Pixel,
  viewTypes,
} from "@visian/utils";
import {
  IDocument,
  IImageLayer,
  IRenderLoopSubscriber,
  ISliceRenderer,
} from "@visian/ui-shared";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import { reaction } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import { Slice } from "./slice";
import {
  getOrder,
  getPositionWithinPixel,
  getWebGLSize,
  resizeRenderer,
  setMainCameraPlanes,
  synchCrosshairs,
} from "./utils";

export class SliceRenderer implements IDisposable, ISliceRenderer {
  private _renderers: THREE.WebGLRenderer[];
  private mainCamera: THREE.OrthographicCamera;
  private sideCamera: THREE.OrthographicCamera;
  private scenes = viewTypes.map(() => new THREE.Scene());

  private slices: Slice[];

  private lazyRenderTriggered = true;

  private isImageLoaded = false;

  private resizeSensors: ResizeSensor[] = [];

  private renderLoopSubscribers: IRenderLoopSubscriber[] = [];

  private disposers: IDisposer[] = [];

  constructor(
    private mainCanvas: HTMLCanvasElement,
    private upperSideCanvas: HTMLCanvasElement,
    private lowerSideCanvas: HTMLCanvasElement,
    private document: IDocument,
  ) {
    this._renderers = this.canvases.map(
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

    this.slices = viewTypes.map((viewType) => new Slice(document, viewType));
    this.slices.forEach((slice, viewType) => this.scenes[viewType].add(slice));

    window.addEventListener("resize", this.resize);
    this.resize();

    this.resizeSensors.push(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      new ResizeSensor(this.upperSideCanvas.parentElement!, () =>
        resizeRenderer(this._renderers[1], this.eagerRender),
      ),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      new ResizeSensor(this.lowerSideCanvas.parentElement!, () =>
        resizeRenderer(this._renderers[2], this.eagerRender),
      ),
    );

    this.disposers.push(
      reaction(
        () => (document.layers[1] as IImageLayer).image as RenderedImage,
        (image?: RenderedImage, oldImage?: RenderedImage) => {
          if (oldImage) {
            this.unsubscribeFromRenderLoop(oldImage);
          }

          if (!image) return;
          this.setImage(image);

          // Wrapped in a setTimeout, because if no image was previously loaded
          // the side views need to actually appear before updating the camera planes.
          setTimeout(this.updateCamera);
        },
        { fireImmediately: true },
      ),
      reaction(
        () => (document.layers[0] as IImageLayer).image as RenderedImage,
        (image?: RenderedImage, oldImage?: RenderedImage) => {
          if (oldImage) {
            this.unsubscribeFromRenderLoop(oldImage);
          }

          this.setAnnotation(image);
        },
        { fireImmediately: true },
      ),
      reaction(
        () => document.viewport2D.mainViewType,
        (newMainView, oldMainView) => {
          if (document.viewport2D.showSideViews) {
            synchCrosshairs(
              newMainView,
              oldMainView,
              this.slices[newMainView],
              this.slices[oldMainView],
              document,
            );
          } else {
            this.slices[newMainView].setCrosshairSynchOffset();
          }

          this.updateCamera();
        },
      ),
      reaction(
        () => document.viewport2D.showSideViews,
        () => {
          // Wrapped in a setTimeout, because the side views need to actually
          // appear before updating the camera planes.
          setTimeout(this.updateCamera);
        },
      ),
    );

    this._renderers[0].setAnimationLoop(this.animate);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.slices.forEach((slice) => slice.dispose());
    window.removeEventListener("resize", this.resize);
    this.resizeSensors.forEach((sensor) => sensor.detach());
  }

  public get renderers() {
    return this._renderers;
  }

  public getOutline(viewType = this.document.viewport2D.mainViewType) {
    return this.slices[viewType].outline;
  }

  public subscribeToRenderLoop(subscriber: IRenderLoopSubscriber) {
    this.renderLoopSubscribers.push(subscriber);
  }

  public unsubscribeFromRenderLoop(unsubscriber: IRenderLoopSubscriber) {
    this.renderLoopSubscribers = this.renderLoopSubscribers.filter(
      (subscriber) => subscriber !== unsubscriber,
    );
  }

  private resize = () => {
    this._renderers[0].setSize(window.innerWidth, window.innerHeight);

    setMainCameraPlanes(this.document, this.mainCanvas, this.mainCamera);

    this.eagerRender();
  };

  private updateCamera = () => {
    setMainCameraPlanes(this.document, this.mainCanvas, this.mainCamera);
    this.lazyRender();
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
  public getMainViewScreenPosition(webGLPosition: Pixel) {
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
  public getMainViewWebGLPosition(screenPosition: Pixel) {
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

  /**
   * Converts a screen position to virtual uv coordinates of the main view slice.
   * Virtual means, that uv coordinates can be outside the [0, 1] range aswell.
   */
  public getVirtualMainViewUV(screenPosition: Pixel) {
    const webGLPosition = this.getMainViewWebGLPosition(screenPosition);
    const sliceRelativePosition = this.slices[
      this.document.viewport2D.mainViewType
    ]
      .worldToLocal(new THREE.Vector3(webGLPosition.x, webGLPosition.y, 0))
      .addScalar(0.5);

    return {
      x: 1 - sliceRelativePosition.x,
      y: sliceRelativePosition.y,
    };
  }

  public showBrushCursorPreview(
    viewType = this.document.viewport2D.mainViewType,
  ) {
    const slice = this.slices[viewType];

    const uvOffset = new THREE.Vector2(slice.position.x, slice.position.y)
      .divide(new THREE.Vector2(slice.scale.x, slice.scale.y))
      .sub(slice.crosshairSynchOffset);
    uvOffset.x *= -1;

    const centeredUV = new THREE.Vector2().setScalar(0.5).sub(uvOffset);

    this.alignBrushCursor(centeredUV, viewType, true);

    slice.previewBrushCursor.show();
  }

  public alignBrushCursor(
    uv: Pixel,
    viewType = this.document.viewport2D.mainViewType,
    preview = false,
  ) {
    const { image } = this.document.layers[1] as IImageLayer;
    if (image) return;

    const { voxelCount } = image;

    const [widthAxis, heightAxis] = getPlaneAxes(viewType);
    const scanWidth = voxelCount[widthAxis];
    const scanHeight = voxelCount[heightAxis];

    const { brushSize } = this.document.tools;

    let isRight = false;
    let isBottom = false;
    if (brushSize === 0.5) {
      [isRight, isBottom] = getPositionWithinPixel(uv, scanWidth, scanHeight);
    }

    const xOffset = brushSize === 0.5 ? (isRight ? 1 : 2) : 0.5;
    const yOffset = brushSize === 0.5 ? (isBottom ? -1 : 0) : 0.5;

    const brushCursor = preview
      ? this.slices[viewType].previewBrushCursor
      : this.slices[viewType].brushCursor;

    brushCursor.setUVTarget(
      (Math.floor(uv.x * scanWidth) + xOffset) / scanWidth,
      (Math.floor(uv.y * scanHeight) + yOffset) / scanHeight,
    );
  }

  private get canvases() {
    return [this.mainCanvas, this.upperSideCanvas, this.lowerSideCanvas];
  }

  private get activeRenderers() {
    return this.document.viewport2D.showSideViews
      ? this._renderers
      : [this._renderers[0]];
  }

  private eagerRender = () => {
    if (!this.isImageLoaded) return;
    this.lazyRenderTriggered = false;

    this.renderLoopSubscribers.forEach((subscriber) => subscriber.render());

    const order = getOrder(this.document.viewport2D.mainViewType);
    this.activeRenderers.forEach((renderer, index) => {
      const viewType = order[index];
      const camera = index ? this.sideCamera : this.mainCamera;
      renderer.render(this.scenes[viewType], camera);
    });
  };

  private setImage(image: RenderedImage) {
    this.slices.forEach((slice) => slice.setImage(image));
    this.isImageLoaded = true;

    image.setRenderers(this._renderers);

    this.subscribeToRenderLoop(image);

    this.lazyRender();
  }

  private setAnnotation(image?: RenderedImage) {
    this.slices.forEach((slice) => slice.setAnnotation(image));

    image?.setRenderers(this._renderers);

    if (image) this.subscribeToRenderLoop(image);

    this.lazyRender();
  }
}

export default SliceRenderer;
