import {
  IEditor,
  IImageLayer,
  ILayerParameter,
  IVolumeRenderer,
} from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

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

export class VolumeRenderer implements IVolumeRenderer, IDisposable {
  private sharedUniforms: SharedUniforms;

  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene = new THREE.Scene();
  public xrGeometry?: THREE.Group;

  private intermediateRenderTarget: THREE.WebGLRenderTarget;
  private screenAlignedQuad: ScreenAlignedQuad;

  private volume: Volume;

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
    // Position the volume in a reasonable height for XR.
    this.volume.position.set(0, 1.2, 0);
    this.scene.add(this.volume);
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.volume.onBeforeRender = (_renderer, _scene, camera) => {
      if (this.renderer.xr.isPresenting) {
        this.updateCameraPosition(camera);
      }
    };

    this.intermediateRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    // this.intermediateRenderTarget.texture.magFilter = THREE.NearestFilter;
    this.screenAlignedQuad = ScreenAlignedQuad.forTexture(
      this.intermediateRenderTarget.texture,
    );

    const url = new URL(window.location.href);
    const resolutionStepsParam = url.searchParams.get("resolutionSteps");
    const resolutionSteps = resolutionStepsParam
      ? Math.min(5, Math.max(1, parseInt(resolutionStepsParam)))
      : 3;
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
        () => {
          const layerParameter =
            editor.activeDocument?.viewport3D.activeTransferFunction?.params
              .image;
          if (!layerParameter) return undefined;

          const layerId = (layerParameter as ILayerParameter).value;
          if (!layerId) return undefined;

          // As we already know that the layer parameter exist, we can be sure
          // that the active document is not undefined.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const imageLayer = editor.activeDocument!.getLayer(layerId);
          return imageLayer ? (imageLayer as IImageLayer).image : undefined;
        },
        () => {
          this.onCameraMove(false);
        },
      ),
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
    );
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
    this.gradientComputer.dispose();
    this.laoComputer.dispose();
    this.screenAlignedQuad.dispose();
    this.resolutionComputer.dispose();
    this.renderer.dispose();
    this.intermediateRenderTarget.dispose();
    this.sharedUniforms.dispose();
    this.disposers.forEach((disposer) => disposer());
  };

  private resize = () => {
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
      this.editor.activeDocument?.viewport3D.shadingMode === "lao" &&
      ((this.resolutionComputer.fullResolutionFlushed &&
        !this.laoComputer.isFinalLAOFlushed) ||
        this.laoComputer.isDirty)
    ) {
      this.laoComputer.tick();
    }

    if (this.renderer.xr.isPresenting) {
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

  public lazyRender = (updateLighting = false) => {
    this.lazyRenderTriggered = true;

    if (updateLighting) {
      this.laoComputer.setDirty();
      this.gradientComputer.updateOutputDerivative();
    }
  };

  private eagerRender = () => {
    if (
      !this.editor.activeDocument?.viewport3D.activeTransferFunction?.params
        .image.value
    ) {
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
        this.camera.matrix,
      );
    }

    this.updateCameraPosition();
    this.lazyRender();
  };

  /**
   * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
   */
  private updateCameraPosition(camera: THREE.Camera = this.camera) {
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

  // XR Management
  protected setupXRWorld(): void {
    if (this.xrGeometry) return;
    this.xrGeometry = new THREE.Group();

    // Controllers
    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    const model1 = controllerModelFactory.createControllerModel(
      controllerGrip1,
    );
    controllerGrip1.add(model1);
    this.xrGeometry.add(controllerGrip1);

    const controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    const model2 = controllerModelFactory.createControllerModel(
      controllerGrip2,
    );
    controllerGrip2.add(model2);
    this.xrGeometry.add(controllerGrip2);

    // Floor
    this.xrGeometry.add(new THREE.GridHelper(5, 10));

    // Mount to Scene
    this.scene.add(this.xrGeometry);
  }

  protected destroyXRWorld(): void {
    if (!this.xrGeometry) return;
    this.scene.remove(this.xrGeometry);
    this.xrGeometry = undefined;
  }

  public isInXR() {
    return this.renderer.xr.isPresenting;
  }

  protected onXRSessionEnded = () => {
    this.editor.activeDocument?.viewport3D.setIsInXR(false);
    this.renderer.xr.removeEventListener("sessionend", this.onXRSessionEnded);
    this.destroyXRWorld();
    this.resize();
  };
  protected onXRSessionStarted = (session: THREE.XRSession) => {
    this.editor.activeDocument?.viewport3D.setIsInXR(true);
    this.renderer.xr.setSession(session);
    this.renderer.xr.addEventListener("sessionend", this.onXRSessionEnded);
    this.setupXRWorld();
  };

  public enterXR = async () => {
    if (this.isInXR()) return;

    this.editor.activeDocument?.viewport3D.transferFunctions[
      "fc-cone"
    ].params.isConeLocked.setValue(true);

    const sessionInit = { optionalFeatures: ["local-floor"] };
    const session = await (navigator as THREE.Navigator).xr?.requestSession(
      "immersive-vr",
      sessionInit,
    );
    if (!session) return;
    this.onXRSessionStarted(session);
  };

  public exitXR = async () => {
    const session = this.renderer.xr.getSession();
    if (!session) return;
    return session.end();
  };
}
