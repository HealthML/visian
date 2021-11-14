import {
  getPlaneAxes,
  IDisposable,
  IDisposer,
  Pixel,
  ViewType,
  viewTypes,
} from "@visian/utils";
import {
  IEditor,
  IImageLayer,
  ISliceRenderer,
  color as c,
} from "@visian/ui-shared";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import { Slice } from "./slice";
import {
  getOrder,
  getPositionWithinPixel,
  getWebGLSizeFromCamera,
  setCameraPlanes,
} from "./utils";
import { RenderedSheet } from "../rendered-sheet";

export class SliceRenderer implements IDisposable, ISliceRenderer {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private scene = new THREE.Scene();
  private renderedSheets: RenderedSheet[];

  public slices: Slice[];

  private lazyRenderTriggered = true;

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor) {
    this.renderer = editor.renderer;

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, -20, 20);

    this.slices = viewTypes.map((viewType) => new Slice(editor, viewType));
    this.scene.add(this.slices[ViewType.Transverse]);

    const upperSideViewSheet = new RenderedSheet(
      editor,
      "upperSideView",
      this.camera,
    );
    upperSideViewSheet.add(this.slices[1]);
    this.slices[1].position.z = 10;

    const lowerSideViewSheet = new RenderedSheet(
      editor,
      "lowerSideView",
      this.camera,
    );
    lowerSideViewSheet.add(this.slices[2]);
    this.slices[2].position.z = 10;

    this.renderedSheets = [upperSideViewSheet, lowerSideViewSheet];
    this.scene.add(...this.renderedSheets);
    this.scene.background = new THREE.Color(0x0c0e1b);

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

          if (!this.slices.find((slice) => slice.isMainView)) {
            this.slices[oldMainView].isMainView = true;
          }

          if (editor.activeDocument?.viewport2D.showSideViews) {
            this.slices[newMainView].ensureMainViewTransformation();
          } else {
            this.slices[newMainView].setCrosshairSynchOffset();
          }

          this.updateMainBrushCursor();

          this.updateCamera();

          const order = getOrder(newMainView);
          [this.scene, ...this.renderedSheets].forEach((container, index) =>
            container.add(this.slices[order[index]]),
          );

          this.lazyRender();
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
            this.updateMainBrushCursor();

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
      autorun(this.updateMainBrushCursor),
      autorun(() => {
        (this.scene.background as THREE.Color).set(
          c("background")({ theme: editor.theme }),
        );
        this.lazyRender();
      }),
    );
  }

  public dispose() {
    // TODO: dispose rendered sheets
    this.disposers.forEach((disposer) => disposer());
    this.slices.forEach((slice) => slice.dispose());
    window.removeEventListener("resize", this.resize);
  }

  private get viewportElements() {
    return [
      this.renderer.domElement,
      this.editor.refs.upperSideView?.current,
      this.editor.refs.lowerSideView?.current,
    ];
  }

  private get canvas() {
    return this.viewportElements[0] as HTMLCanvasElement;
  }

  public getOutline(
    viewType = this.editor.activeDocument?.viewport2D.mainViewType ??
      ViewType.Transverse,
  ) {
    return this.slices[viewType].outline;
  }

  public resize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (!this.editor.activeDocument) return;

    setCameraPlanes(this.editor, this.canvas, this.camera);

    this.eagerRender();

    // Wrapped in setTimeout to ensure the DOM has updated.
    setTimeout(() => {
      this.renderedSheets.forEach((renderedSheet) =>
        renderedSheet.synchPosition(),
      );

      this.eagerRender();
    }, 10);
  };

  private updateCamera = () => {
    if (!this.editor.activeDocument) return;

    setCameraPlanes(this.editor, this.canvas, this.camera);
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

  public getWebGLSize() {
    return getWebGLSizeFromCamera(this.camera);
  }

  /** Converts a WebGL position to a screen space one. */
  public getMainViewScreenPosition(webGLPosition: Pixel): Pixel {
    const boundingBox = this.canvas.getBoundingClientRect();
    const webGLSize = this.getWebGLSize();
    return {
      x:
        ((webGLPosition.x - this.camera.left) / webGLSize.x) *
          boundingBox.width +
        boundingBox.left,
      y:
        ((webGLPosition.y - this.camera.top) / -webGLSize.y) *
          boundingBox.height +
        boundingBox.top,
    };
  }

  /** Converts a screen space position to a WebGL one. */
  public getWebGLPosition(screenPosition: Pixel): Pixel {
    if (!this.editor.activeDocument) return { x: 0, y: 0 };

    const boundingBox = this.canvas.getBoundingClientRect();
    const webGLSize = this.getWebGLSize();

    return {
      x:
        ((screenPosition.x - boundingBox.left) / boundingBox.width) *
          webGLSize.x +
        this.camera.left,
      y:
        ((screenPosition.y - boundingBox.top) / boundingBox.height) *
          -webGLSize.y +
        this.camera.top,
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
    const webGLPosition = this.getWebGLPosition(screenPosition);
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

  private updateMainBrushCursor = () => {
    if (
      !this.editor.activeDocument ||
      this.editor.activeDocument?.viewSettings.viewMode !== "2D"
    ) {
      return;
    }
    this.alignBrushCursor(this.editor.activeDocument.viewport2D.hoveredUV);
  };

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

  public eagerRender = () => {
    if (
      !this.editor.activeDocument ||
      this.editor.activeDocument.layers.length < 1
    ) {
      this.renderer.clear();
      return;
    }
    this.lazyRenderTriggered = false;

    this.renderer.render(this.scene, this.camera);
  };

  public resetCrosshairOffset() {
    this.slices.forEach((slice) => slice.setCrosshairSynchOffset());
  }
}
