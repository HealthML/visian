import {
  getPlaneAxes,
  IDisposable,
  IDisposer,
  Pixel,
  ViewType,
  viewTypes,
} from "@visian/utils";
import { IEditor, IImageLayer, ISliceRenderer } from "@visian/ui-shared";
import { reaction } from "mobx";
import * as THREE from "three";

import { Slice } from "./slice";
import {
  getOrder,
  getPositionWithinPixel,
  getWebGLSizeFromCamera,
  setMainCameraPlanes,
  synchCrosshairs,
} from "./utils";

export class SliceRenderer implements IDisposable, ISliceRenderer {
  private _renderers: THREE.WebGLRenderer[];
  private canvases: HTMLCanvasElement[];
  private mainCamera: THREE.OrthographicCamera;
  private sideCamera: THREE.OrthographicCamera;
  private scenes = viewTypes.map(() => new THREE.Scene());

  private slices: Slice[];

  private lazyRenderTriggered = true;

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor) {
    this._renderers = editor.renderers;

    this.canvases = editor.renderers.map((renderer) => renderer.domElement);

    const aspect = this.canvases[0].clientWidth / this.canvases[0].clientHeight;
    this.mainCamera = new THREE.OrthographicCamera(
      -aspect,
      aspect,
      1,
      -1,
      0,
      20,
    );
    this.sideCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 20);

    this.slices = viewTypes.map((viewType) => new Slice(editor, viewType));
    this.slices.forEach((slice, viewType) => this.scenes[viewType].add(slice));

    window.addEventListener("resize", this.resize);
    this.resize();

    this.disposers.push(
      reaction(
        () => editor.activeDocument && editor.activeDocument.layers.length > 0,
        () => {
          // Wrapped in a setTimeout, because if no image was previously loaded
          // the side views need to actually appear before updating the camera planes.
          setTimeout(this.updateCamera);
        },
      ),
      reaction(
        () => editor.activeDocument?.viewport2D.mainViewType,
        (newMainView, oldMainView) => {
          if (newMainView === undefined || oldMainView === undefined) return;

          if (editor.activeDocument?.viewport2D.showSideViews) {
            synchCrosshairs(
              newMainView,
              oldMainView,
              this.slices[newMainView],
              this.slices[oldMainView],
              editor.activeDocument,
            );
          } else {
            this.slices[newMainView].setCrosshairSynchOffset();
          }

          this.updateCamera();
        },
      ),
      reaction(
        () => editor.activeDocument?.viewport2D.showSideViews,
        () => {
          // Wrapped in a setTimeout, because the side views need to actually
          // appear before updating the camera planes.
          setTimeout(this.updateCamera);
        },
      ),
      reaction(
        () => editor.activeDocument?.viewSettings.viewMode === "2D",
        (switchingTo2D?: boolean) => {
          if (switchingTo2D) {
            // Wrapped in a setTimeout, because the side views need to actually
            // appear before updating the camera planes.
            setTimeout(this.updateCamera);
          }
        },
      ),
      reaction(
        () => editor.activeDocument?.viewSettings.viewMode,
        this.lazyRender,
      ),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.slices.forEach((slice) => slice.dispose());
    window.removeEventListener("resize", this.resize);
  }

  public get renderers() {
    return this._renderers;
  }

  public getOutline(
    viewType = this.editor.activeDocument?.viewport2D.mainViewType ??
      ViewType.Transverse,
  ) {
    return this.slices[viewType].outline;
  }

  public resize = () => {
    this._renderers[0].setSize(window.innerWidth, window.innerHeight);

    if (!this.editor.activeDocument) return;

    setMainCameraPlanes(this.editor, this.canvases[0], this.mainCamera);

    this.eagerRender();
  };

  private updateCamera = () => {
    if (!this.editor.activeDocument) return;

    setMainCameraPlanes(this.editor, this.canvases[0], this.mainCamera);
    this.lazyRender();
  };

  public animate = () => {
    if (this.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    if (this.lazyRenderTriggered) {
      this.eagerRender();
    }
  };

  public lazyRender = () => {
    this.lazyRenderTriggered = true;
  };

  public getWebGLSize(
    viewType = this.editor.activeDocument?.viewport2D.mainViewType,
  ) {
    return getWebGLSizeFromCamera(
      viewType === this.editor.activeDocument?.viewport2D.mainViewType
        ? this.mainCamera
        : this.sideCamera,
    );
  }

  /** Converts a WebGL position to a screen space one. */
  public getMainViewScreenPosition(webGLPosition: Pixel): Pixel {
    const boundingBox = this.canvases[0].getBoundingClientRect();
    const webGLSize = this.getWebGLSize();
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
  public getWebGLPosition(
    screenPosition: Pixel,
    viewType = this.editor.activeDocument?.viewport2D.mainViewType ??
      ViewType.Transverse,
  ): Pixel {
    if (!this.editor.activeDocument) return { x: 0, y: 0 };

    const canvasIndex = getOrder(
      this.editor.activeDocument?.viewport2D.mainViewType,
    ).indexOf(viewType);
    const canvas = this.canvases[canvasIndex];

    const boundingBox = canvas.getBoundingClientRect();
    const webGLSize = this.getWebGLSize(viewType);

    const camera = canvasIndex ? this.sideCamera : this.mainCamera;

    return {
      x:
        ((screenPosition.x - boundingBox.left) / boundingBox.width) *
          webGLSize.x +
        camera.left,
      y:
        ((screenPosition.y - boundingBox.top) / boundingBox.height) *
          -webGLSize.y +
        camera.top,
    };
  }

  /**
   * Converts a screen position to virtual uv coordinates of the slice
   * corresponding to the provided view type.
   * Virtual means, that uv coordinates can be outside the [0, 1] range aswell.
   */
  public getVirtualUVs(
    screenPosition: Pixel,
    viewType = this.editor.activeDocument?.viewport2D.mainViewType ??
      ViewType.Transverse,
  ) {
    const webGLPosition = this.getWebGLPosition(screenPosition, viewType);
    return this.slices[viewType].getVirtualUVs(
      new THREE.Vector3(webGLPosition.x, webGLPosition.y, 0),
    );
  }

  public showBrushCursorPreview(
    viewType = this.editor.activeDocument?.viewport2D.mainViewType ??
      ViewType.Transverse,
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
    viewType = this.editor.activeDocument?.viewport2D.mainViewType ??
      ViewType.Transverse,
    preview = false,
  ) {
    if (!this.editor.activeDocument || !this.editor.activeDocument.activeLayer)
      return;

    const imageLayer = this.editor.activeDocument.activeLayer;

    const { voxelCount } = (imageLayer as IImageLayer).image;

    const [widthAxis, heightAxis] = getPlaneAxes(viewType);
    const scanWidth = voxelCount[widthAxis];
    const scanHeight = voxelCount[heightAxis];

    const { brushSize } = this.editor.activeDocument.tools;

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

  private get activeRenderers() {
    return this.editor.activeDocument?.viewport2D.showSideViews
      ? this._renderers
      : [this._renderers[0]];
  }

  public eagerRender = () => {
    if (
      !this.editor.activeDocument ||
      this.editor.activeDocument.layers.length < 1
    ) {
      return;
    }
    this.lazyRenderTriggered = false;

    const order = getOrder(
      this.editor.activeDocument?.viewport2D.mainViewType ??
        ViewType.Transverse,
    );
    this.activeRenderers.forEach((renderer, index) => {
      const viewType = order[index];
      const camera = index ? this.sideCamera : this.mainCamera;
      renderer.render(this.scenes[viewType], camera);
    });
  };
}

export default SliceRenderer;
