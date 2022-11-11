import { DragPoint, IEditor, IVolumeRenderer } from "@visian/ui-shared";
import { IDisposer, Vector, ViewType, Voxel } from "@visian/utils";
import { autorun, computed, makeObservable, reaction } from "mobx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

import { RenderedImage } from "../rendered-image";
import { ScreenAlignedQuad } from "../screen-aligned-quad";
import {
  AxesConvention,
  DitheringRenderer,
  FlyControls,
  generateHistogram,
  GradientComputer,
  LAOComputer,
  ResolutionComputer,
  SharedUniforms,
} from "./utils";
import { Volume } from "./volume";
import { XRManager } from "./xr-manager";

export class VolumeRenderer implements IVolumeRenderer {
  public readonly excludeFromSnapshotTracking = ["editor"];

  private sharedUniforms: SharedUniforms;

  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene = new THREE.Scene();
  public xr: XRManager;

  private intermediateRenderTarget: THREE.WebGLRenderTarget;
  private screenAlignedQuad: ScreenAlignedQuad;

  public volume: Volume;

  private orbitControls: OrbitControls;
  private flyControls: FlyControls;
  private raycaster = new THREE.Raycaster();

  private stats: Stats;

  private lazyRenderTriggered = true;

  private resolutionComputer: ResolutionComputer;
  private ditheringRenderer: DitheringRenderer;
  private gradientComputer: GradientComputer;
  private laoComputer: LAOComputer;

  // These two variables are used to progressively calculate the gradient histogram of the main image layer
  private currentGradientHistogramSlice = 0;
  private gradientMagnitudes: number[] = [];

  private pickingTexture = new THREE.WebGLRenderTarget(1, 1);

  private axesConvention: AxesConvention;

  private workingVector3 = new THREE.Vector3();
  private workingVector4 = new THREE.Vector4();
  private workingMatrix = new THREE.Matrix4();

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor) {
    this.sharedUniforms = new SharedUniforms(editor);

    this.renderer = editor.renderer;
    this.renderer.xr.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.0001,
      10,
    );

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
    const orbitTarget = editor.activeDocument?.viewport3D.orbitTarget;
    if (orbitTarget) {
      this.orbitControls.target.set(
        orbitTarget.x,
        orbitTarget.y,
        orbitTarget.z,
      );
    }
    this.orbitControls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.orbitControls.addEventListener("change", this.onOrbitControlsChange);

    this.flyControls = new FlyControls(this.camera, this.renderer.domElement);
    this.flyControls.addEventListener("change", () => this.onCameraMove());
    this.flyControls.addEventListener("lock", this.onFlyControlsLock);
    this.flyControls.addEventListener("unlock", this.onFlyControlsUnlock);

    const matrix = editor.activeDocument?.viewport3D.cameraMatrix;
    if (matrix) this.camera.applyMatrix4(matrix);
    this.camera.updateMatrixWorld();

    this.gradientComputer = new GradientComputer(
      this.editor,
      this.renderer,
      this.sharedUniforms,
    );
    this.laoComputer = new LAOComputer(
      this.editor,
      this.sharedUniforms,
      this.gradientComputer.getFirstDerivative(),
      // this.gradientComputer.getSecondDerivative(),
      this.updateCurrentResolution,
    );

    this.volume = new Volume(
      editor,
      this.sharedUniforms,
      this.gradientComputer.getFirstDerivative(),
      // this.gradientComputer.getSecondDerivative(),
      this.gradientComputer.getOutputDerivative(),
      this.laoComputer.output,
    );

    this.scene.add(this.volume);
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.volume.onBeforeRender = (_renderer, _scene, camera) => {
      if (this.renderer.xr.isPresenting) {
        this.updateCameraPosition(camera);
      }
    };
    this.resetScene();
    this.xr = new XRManager(this, editor);

    this.intermediateRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.screenAlignedQuad = ScreenAlignedQuad.forTexture(
      this.intermediateRenderTarget.texture,
    );

    this.resolutionComputer = new ResolutionComputer(
      editor,
      { scene: this.scene, camera: this.camera },
      this.renderer,
      new THREE.Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height,
      ),
      this.eagerRender,
      this.volume.mainMaterial,
      this.intermediateRenderTarget,
    );
    this.ditheringRenderer = new DitheringRenderer(
      { scene: this.scene, camera: this.camera },
      this.renderer,
      new THREE.Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height,
      ),
      this.eagerRender,
      this.volume.mainMaterial,
      this.intermediateRenderTarget,
    );

    window.addEventListener("resize", this.resize);
    this.resize();

    // TypeScript doesn't recognize that Stats has a constructor...
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.stats = new (Stats as any)();
    this.renderer.domElement.parentElement?.appendChild(this.stats.dom);
    this.stats.dom.style.right = "0";
    this.stats.dom.style.left = "auto";

    this.axesConvention = new AxesConvention(editor);

    this.disposers.push(
      reaction(
        () => editor.activeDocument?.viewSettings.viewMode,
        (viewMode) => {
          switch (viewMode) {
            case "2D":
              if (this.flyControls.isLocked) this.flyControls.unlock();
              this.orbitControls.enabled = false;
              break;
            case "3D":
              this.orbitControls.enabled = !this.flyControls.isLocked;
          }

          this.lazyRender();
        },
        { fireImmediately: true },
      ),
      autorun(() => {
        this.orbitControls.mouseButtons.LEFT =
          editor.activeDocument?.tools.activeTool?.name !== "smart-brush-3d"
            ? THREE.MOUSE.ROTATE
            : -1;
      }),
      reaction(
        () => editor.activeDocument?.viewport3D.cameraMatrix?.toArray(),
        (array?: number[]) => {
          if (array) {
            this.workingMatrix.fromArray(array);
            this.camera.position.setFromMatrixPosition(this.workingMatrix);
            this.camera.rotation.setFromRotationMatrix(this.workingMatrix);

            this.camera.updateMatrixWorld();
          }
          this.onCameraMove(false);
          this.lazyRender();
        },
      ),
      reaction(
        () => editor.activeDocument?.viewport3D.orbitTarget.toArray(),
        () => {
          const target = editor.activeDocument?.viewport3D.orbitTarget;
          if (target) {
            this.orbitControls.target.set(target.x, target.y, target.z);
          }
        },
      ),
      reaction(
        () =>
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .isConeLocked?.value,
        (value?: unknown) => {
          if (value === false) {
            this.onCameraMove(false);
          }
        },
      ),
      reaction(
        () => editor.activeDocument?.tools.activeTool?.name === "fly-tool",
        this.toggleFly,
      ),
      autorun(() => {
        this.orbitControls.enableZoom =
          this.editor.activeDocument?.tools.activeTool?.name !== "plane-tool";
      }),
      reaction(
        () =>
          editor.activeDocument?.tools.activeTool?.name === "smart-brush-3d" &&
          editor.activeDocument?.viewSettings.viewMode === "3D",
        (is3DSmartBrushSelected: boolean) => {
          if (is3DSmartBrushSelected) {
            this.renderer.domElement.addEventListener(
              "pointerdown",
              this.onSmartBrushClick,
            );
          } else {
            this.renderer.domElement.removeEventListener(
              "pointerdown",
              this.onSmartBrushClick,
            );
          }
        },
        { fireImmediately: true },
      ),
    );

    makeObservable(this, {
      renderedImageLayerCount: computed,
    });
  }

  public dispose = () => {
    this.volume.dispose();
    window.removeEventListener("resize", this.resize);
    this.orbitControls.removeEventListener("change", this.onCameraMove);
    this.orbitControls.dispose();
    this.flyControls.removeEventListener("change", () => this.onCameraMove());
    this.flyControls.removeEventListener("lock", this.onFlyControlsLock);
    this.flyControls.removeEventListener("unlock", this.onFlyControlsUnlock);
    this.flyControls.dispose();
    document.removeEventListener("click", this.selectNavigationTool);
    this.renderer.domElement.removeEventListener(
      "pointerdown",
      this.onSmartBrushClick,
    );
    this.gradientComputer.dispose();
    this.laoComputer.dispose();
    this.screenAlignedQuad.dispose();
    this.resolutionComputer.dispose();
    this.ditheringRenderer.dispose();
    this.renderer.dispose();
    this.intermediateRenderTarget.dispose();
    this.sharedUniforms.dispose();
    this.disposers.forEach((disposer) => disposer());
    this.axesConvention.dispose();
  };

  public get renderedImageLayerCount() {
    // additional layer for 3d region growing preview
    return (this.editor.activeDocument?.imageLayers.length || 0) + 1;
  }

  public resetScene(hardReset = false) {
    // Position the volume in a reasonable height for XR.
    this.volume.resetRotation();
    this.volume.position.set(0, 1.2, 0);

    if (hardReset) {
      this.editor.activeDocument?.viewport3D.setCameraMatrix();
      this.editor.activeDocument?.viewport3D.setOrbitTarget();
    }
  }

  public resize = () => {
    const aspect = window.innerWidth / window.innerHeight;

    this.resolutionComputer.setSize(window.innerWidth, window.innerHeight);
    this.ditheringRenderer.setSize(window.innerWidth, window.innerHeight);

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.lazyRender();
  };

  private tickGradientHistogram = () => {
    if (this.editor.activeDocument?.mainImageLayer) {
      const buffer = (
        this.editor.activeDocument?.mainImageLayer.image as RenderedImage
      ).textureAdapter.readSlice(
        this.currentGradientHistogramSlice,
        ViewType.Transverse,
        this.renderer,
        this.gradientComputer.getFirstDerivative(),
      );

      const workingVector = new THREE.Vector3();
      for (let i = 0; i < buffer.length; i += 4) {
        workingVector.set(buffer[i], buffer[i + 1], buffer[i + 2]);
        this.gradientMagnitudes.push(workingVector.length());
      }

      this.currentGradientHistogramSlice++;
      if (
        this.currentGradientHistogramSlice ===
        this.editor.activeDocument?.mainImageLayer?.image.voxelCount.z
      ) {
        this.editor.activeDocument?.mainImageLayer?.setGradientHistogram(
          generateHistogram(this.gradientMagnitudes),
        );
      }
    }
  };

  public animate = () => {
    if (this.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    this.gradientComputer.tick();

    if (
      this.currentGradientHistogramSlice <
        (this.editor.activeDocument?.mainImageLayer?.image.voxelCount.z || 0) &&
      this.editor.performanceMode === "high"
    ) {
      this.tickGradientHistogram();
    }

    if (
      (this.editor.activeDocument?.viewport3D.shadingMode === "lao" ||
        this.editor.activeDocument?.viewport3D.requestedShadingMode ===
          "lao") &&
      ((this.resolutionComputer.fullResolutionFlushed &&
        !this.laoComputer.isFinalLAOFlushed) ||
        this.laoComputer.isDirty)
    ) {
      this.laoComputer.tick();
    } else if (
      this.editor.activeDocument?.viewport3D.requestedShadingMode === "lao"
    ) {
      this.editor.activeDocument?.viewport3D.confirmRequestedShadingMode();
    }

    if (this.renderer.xr.isPresenting) {
      this.xr.animate();
      this.eagerRender();
      // TODO: Render spectator view
      return;
    }

    if (this.lazyRenderTriggered) {
      this.resolutionComputer.restart();
      this.ditheringRenderer.restart();
      this.lazyRenderTriggered = false;
    }

    if (!this.resolutionComputer.fullResolutionFlushed) {
      this.resolutionComputer.tick();
    } else if (
      (!(
        this.editor.activeDocument?.viewport3D.shadingMode === "lao" ||
        this.editor.activeDocument?.viewport3D.requestedShadingMode === "lao"
      ) ||
        (this.laoComputer.isFinalLAOFlushed && !this.laoComputer.isDirty)) &&
      this.editor.performanceMode === "high" &&
      !this.ditheringRenderer.isFinished
    ) {
      this.ditheringRenderer.tick();
    }

    this.stats.update();
    this.flyControls.tick();
  };

  public lazyRender = (updateLighting = false, updateGradients = false) => {
    this.lazyRenderTriggered = true;

    if (updateGradients) {
      this.gradientComputer.updateAllDerivatives();
      this.currentGradientHistogramSlice = 0;
      this.gradientMagnitudes = [];
      this.editor.activeDocument?.mainImageLayer?.setGradientHistogram();
    }

    if (updateLighting) {
      this.laoComputer.setDirty();
      this.gradientComputer.updateOutputDerivative();
    }
  };

  private eagerRender = () => {
    if (!this.editor.activeDocument?.mainImageLayer) {
      this.renderer.clear();
      return;
    }

    this.renderer.setRenderTarget(null);
    if (this.renderer.xr.isPresenting) {
      this.renderer.render(this.scene, this.camera);
    } else {
      // Render output from resolution computer and progressive ray dithering to canvas
      this.screenAlignedQuad.renderWith(this.renderer);

      // Axes convention
      this.camera.getWorldDirection(this.workingVector3);
      this.axesConvention.setCameraDirection(this.workingVector3);

      this.renderer.getViewport(this.workingVector4);

      const axesBox = this.editor.refs.axes3D?.current?.getBoundingClientRect();
      this.renderer.setViewport(
        axesBox?.left ?? 0,
        window.innerHeight - (axesBox?.bottom ?? 0),
        AxesConvention.size,
        AxesConvention.size,
      );

      this.renderer.autoClear = false;
      this.renderer.clearDepth();
      this.renderer.render(this.axesConvention, this.axesConvention.camera);
      this.renderer.autoClear = true;
      this.renderer.setViewport(this.workingVector4);

      this.axesConvention.renderLabels();
    }
  };

  public updateCurrentResolution = () => {
    this.resolutionComputer?.restartFrame();
    this.ditheringRenderer?.restart();
  };

  public get isShowingFullResolution() {
    return this.resolutionComputer.fullResolutionFlushed;
  }

  private onOrbitControlsChange = () => {
    const { target } = this.orbitControls;
    this.editor.activeDocument?.viewport3D.setOrbitTarget(
      target.x,
      target.y,
      target.z,
    );

    this.onCameraMove();
  };

  private onCameraMove = (pushMatrix = true) => {
    if (pushMatrix) {
      this.camera.updateMatrix();
      this.editor.activeDocument?.viewport3D.setCameraMatrix(
        this.camera.matrix.clone(),
      );
    }

    this.updateCameraPosition();
    this.lazyRender();
  };

  /**
   * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
   */
  public updateCameraPosition(camera: THREE.Camera = this.camera) {
    this.volume.updateMatrixWorld();

    this.workingVector3.setFromMatrixPosition(camera.matrixWorld);
    this.workingVector3.applyMatrix4(
      this.workingMatrix.copy(this.volume.matrixWorld).invert(),
    );

    const { x, y, z } = this.workingVector3;
    this.editor.activeDocument?.viewport3D.setVolumeSpaceCameraPosition(
      x,
      y,
      z,
    );
  }

  private onFlyControlsLock = () => {
    this.orbitControls.enabled = false;
    document.addEventListener("pointerdown", this.selectNavigationTool);
  };

  private onFlyControlsUnlock = () => {
    this.orbitControls.enabled = true;
    document.removeEventListener("pointerdown", this.selectNavigationTool);

    this.raycaster.setFromCamera({ x: 0.5, y: 0.5 }, this.camera);
    this.volume.mainMaterial.side = THREE.DoubleSide;
    const intersections = this.raycaster.intersectObject(this.volume);
    this.volume.mainMaterial.side = THREE.BackSide;

    this.camera.getWorldDirection(this.orbitControls.target);
    this.orbitControls.target.multiplyScalar(
      intersections.length === 2
        ? (intersections[0].distance + intersections[1].distance) / 2
        : 1,
    );
    this.orbitControls.target.add(this.camera.position);
    this.onOrbitControlsChange();
  };

  private selectNavigationTool = () => {
    this.editor.activeDocument?.tools.setActiveTool("navigation-tool");
  };

  private toggleFly = () => {
    if (this.flyControls.isLocked) {
      this.flyControls.unlock();
    } else {
      this.flyControls.lock();
    }
  };

  public setVolumeSpaceCameraPosition(position: Vector) {
    this.workingVector3.fromArray(position.toArray());
    this.volume.localToWorld(this.workingVector3);
    this.camera.position.copy(this.workingVector3);
    this.camera.lookAt(this.volume.position);
    this.onCameraMove();
  }

  private getSmartBrushIntersection(event: PointerEvent): Voxel | undefined {
    const image = this.editor.activeDocument?.mainImageLayer?.image;
    if (!image) return undefined;

    const clickPosition = { x: event.clientX, y: event.clientY };
    const canvasRect = this.renderer.domElement.getBoundingClientRect();
    if (
      clickPosition.x <= canvasRect.left ||
      clickPosition.x >= canvasRect.right ||
      clickPosition.y <= canvasRect.top ||
      clickPosition.y >= canvasRect.bottom
    )
      return undefined;

    const canvasPosition = {
      x: clickPosition.x - canvasRect.left,
      y: clickPosition.y - canvasRect.top,
    };

    this.camera.setViewOffset(
      this.renderer.domElement.width,
      this.renderer.domElement.height,
      canvasPosition.x * window.devicePixelRatio,
      canvasPosition.y * window.devicePixelRatio,
      1,
      1,
    );

    this.renderer.setRenderTarget(this.pickingTexture);
    this.volume.onBeforePicking();
    this.renderer.render(this.scene, this.camera);
    this.volume.onAfterPicking();

    this.camera.clearViewOffset();

    const pixelBuffer = new Uint8Array(4);
    this.renderer.readRenderTargetPixels(
      this.pickingTexture,
      0,
      0,
      1,
      1,
      pixelBuffer,
    );

    this.renderer.setRenderTarget(null);

    if (pixelBuffer[3] <= 0) return undefined;

    this.workingVector3.set(
      image.voxelCount.x,
      image.voxelCount.y,
      image.voxelCount.z,
    );

    const seedPoint = new THREE.Vector3(
      pixelBuffer[0],
      pixelBuffer[1],
      pixelBuffer[2],
    )
      .divideScalar(255)
      .multiply(this.workingVector3)
      .floor();

    return seedPoint;
  }

  private onSmartBrushClick = (event: PointerEvent) => {
    if (event.button !== 0) return;

    if (
      !this.editor.activeDocument?.activeLayer?.isVisible ||
      !this.editor.activeDocument?.activeLayer?.isAnnotation
    ) {
      this.editor.activeDocument?.setShowLayerMenu(true);
      return;
    }

    const smartBrush3D =
      this.editor.activeDocument?.tools.tools["smart-brush-3d"];
    if (!smartBrush3D) return;

    const seedPoint = this.getSmartBrushIntersection(event);
    if (!seedPoint) return;

    const seedDragPoint: DragPoint = {
      x: seedPoint.x,
      y: seedPoint.y,
      z: seedPoint.z,
      right: false,
      bottom: false,
    };

    smartBrush3D.startAt(seedDragPoint);
    smartBrush3D.endAt(seedDragPoint);
  };
}
