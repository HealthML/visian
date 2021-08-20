import {
  DragPoint,
  IEditor,
  isPerformanceLow,
  IVolumeRenderer,
} from "@visian/ui-shared";
import {
  convertPositionToWebGLPosition,
  IDisposable,
  IDisposer,
  Vector,
  Voxel,
} from "@visian/utils";
import { autorun, computed, makeObservable, reaction } from "mobx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

import { ScreenAlignedQuad } from "../screen-aligned-quad";
import {
  FlyControls,
  GradientComputer,
  LAOComputer,
  ResolutionComputer,
  SharedUniforms,
} from "./utils";
import { Volume } from "./volume";
import { VolumeMaterial } from "./volume-material";
import { XRManager } from "./xr-manager";

export class VolumeRenderer implements IVolumeRenderer, IDisposable {
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
  private gradientComputer: GradientComputer;
  private laoComputer: LAOComputer;

  private workingVector = new THREE.Vector3();
  private workingMatrix = new THREE.Matrix4();

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor) {
    this.sharedUniforms = new SharedUniforms(editor);

    [this.renderer] = editor.renderers;
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
      this.gradientComputer.getSecondDerivative(),
      this.updateCurrentResolution,
    );

    this.volume = new Volume(
      editor,
      this.sharedUniforms,
      this.gradientComputer.getFirstDerivative(),
      this.gradientComputer.getSecondDerivative(),
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
    // this.intermediateRenderTarget.texture.magFilter = THREE.NearestFilter;
    this.screenAlignedQuad = ScreenAlignedQuad.forTexture(
      this.intermediateRenderTarget.texture,
    );

    const resolutionSteps = isPerformanceLow ? 4 : 3;
    this.resolutionComputer = new ResolutionComputer(
      { scene: this.scene, camera: this.camera },
      this.renderer,
      new THREE.Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height,
      ),
      this.eagerRender,
      resolutionSteps,
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
            this.renderer.domElement.addEventListener(
              "pointermove",
              this.onSmartBrushMove,
            );
          } else {
            this.renderer.domElement.removeEventListener(
              "pointerdown",
              this.onSmartBrushClick,
            );
            this.renderer.domElement.removeEventListener(
              "pointermove",
              this.onSmartBrushMove,
            );
            this.editor.activeDocument?.tools.setIsCursorOverDrawableArea(
              false,
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
    this.renderer.dispose();
    this.intermediateRenderTarget.dispose();
    this.sharedUniforms.dispose();
    this.disposers.forEach((disposer) => disposer());
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

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.lazyRender();
  };

  public animate = () => {
    if (this.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    this.gradientComputer.tick();

    if (
      (this.editor.activeDocument?.viewport3D.shadingMode === "lao" ||
        this.editor.activeDocument?.viewport3D.requestedShadingMode ===
          "lao") &&
      ((this.resolutionComputer.fullResolutionFlushed &&
        !this.laoComputer.isFinalLAOFlushed) ||
        this.laoComputer.isDirty)
    ) {
      this.laoComputer.tick();
    }

    if (this.renderer.xr.isPresenting) {
      this.xr.animate();
      this.eagerRender();
      // TODO: Render spectator view
      return;
    }

    if (this.lazyRenderTriggered) {
      this.resolutionComputer.restart();
      this.lazyRenderTriggered = false;
    }

    if (!this.resolutionComputer.fullResolutionFlushed) {
      this.resolutionComputer.tick();
    }

    this.stats.update();
    this.flyControls.tick();
  };

  public lazyRender = (updateLighting = false, updateGradients = false) => {
    this.lazyRenderTriggered = true;

    if (updateGradients) {
      this.gradientComputer.updateAllDerivatives();
    }

    if (updateLighting) {
      this.laoComputer.setDirty();
      this.gradientComputer.updateOutputDerivative();
    }
  };

  private eagerRender = () => {
    if (!this.editor.activeDocument?.baseImageLayer) {
      this.renderer.clear();
      return;
    }

    this.renderer.setRenderTarget(null);
    if (this.renderer.xr.isPresenting) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.screenAlignedQuad.renderWith(this.renderer);
    }
  };

  public updateCurrentResolution = () => {
    this.resolutionComputer?.restartFrame();
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

    this.workingVector.setFromMatrixPosition(camera.matrixWorld);
    this.workingVector.applyMatrix4(
      this.workingMatrix.copy(this.volume.matrixWorld).invert(),
    );

    const { x, y, z } = this.workingVector;
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
    (this.volume.material as VolumeMaterial).side = THREE.DoubleSide;
    const intersections = this.raycaster.intersectObject(this.volume);
    (this.volume.material as VolumeMaterial).side = THREE.BackSide;

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
    this.workingVector.fromArray(position.toArray());
    this.volume.localToWorld(this.workingVector);
    this.camera.position.copy(this.workingVector);
    this.camera.lookAt(this.volume.position);
    this.onCameraMove();
  }

  private getSmartBrushIntersection(event: PointerEvent): Voxel | undefined {
    const image = this.editor.activeDocument?.baseImageLayer?.image;
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

    const webGLPosition = convertPositionToWebGLPosition(
      canvasPosition,
      canvasRect,
    );

    const objects: THREE.Object3D[] = [];
    if (this.editor.activeDocument?.viewport3D.useClippingPlane) {
      objects.push(this.volume.clippingPlane);
    }
    const useCone =
      this.editor.activeDocument?.viewport3D.activeTransferFunction?.name ===
      "fc-cone";
    if (useCone) {
      objects.push(this.volume.raycastingCone);
      this.volume.raycastingCone.updateGeometry();
      this.volume.raycastingCone.visible = true;
    }

    this.raycaster.setFromCamera(webGLPosition, this.camera);
    const intersections = this.raycaster.intersectObjects(objects);

    if (useCone) {
      this.volume.raycastingCone.visible = false;
    }

    if (!intersections.length) return undefined;

    this.workingVector.set(
      image.voxelCount.x,
      image.voxelCount.y,
      image.voxelCount.z,
    );

    const seedPoint = intersections[0].point;

    this.volume
      .worldToLocal(seedPoint)
      .addScalar(0.5)
      .multiply(this.workingVector)
      .round();

    if (
      seedPoint
        .toArray()
        .every(
          (value, index) =>
            value >= 0 && value < this.workingVector.getComponent(index),
        )
    ) {
      return seedPoint;
    }

    return undefined;
  }

  private onSmartBrushMove = (event: PointerEvent) => {
    this.editor.activeDocument?.tools.setIsCursorOverDrawableArea(
      !!this.getSmartBrushIntersection(event),
    );
  };

  private onSmartBrushClick = (event: PointerEvent) => {
    if (event.button !== 0) return;

    if (
      !this.editor.activeDocument?.activeLayer?.isVisible ||
      !this.editor.activeDocument?.activeLayer?.isAnnotation
    ) {
      this.editor.activeDocument?.setShowLayerMenu(true);
      return;
    }

    const smartBrush3D = this.editor.activeDocument?.tools.tools[
      "smart-brush-3d"
    ];
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
