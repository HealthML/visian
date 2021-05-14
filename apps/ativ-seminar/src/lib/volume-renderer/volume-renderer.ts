import { IDisposer, ScreenAlignedQuad } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

import { VolumeRendererModel } from "../../models";
import { IDisposable } from "../types";
import {
  FlyControls,
  GradientComputer,
  LAOComputer,
  LightingModeType,
  ResolutionComputer,
} from "./utils";
import Volume from "./volume";
import VolumeMaterial from "./volume-material";

export class VolumeRenderer implements IDisposable {
  public model: VolumeRendererModel;

  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene = new THREE.Scene();

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

  constructor(private canvas: HTMLCanvasElement) {
    // In the future the state should be part of the general state tree.
    this.model = new VolumeRendererModel();

    this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas });
    this.renderer.xr.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.0001,
      10,
    );

    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.target.set(0, 1.2, 0);
    this.orbitControls.addEventListener("change", this.onCameraMove);

    this.flyControls = new FlyControls(this.camera, this.canvas);
    this.flyControls.addEventListener("change", this.onCameraMove);
    this.flyControls.addEventListener("lock", this.onFlyControlsLock);
    this.flyControls.addEventListener("unlock", this.onFlyControlsUnlock);

    this.camera.position.set(0.3, 1.5, 0.3);
    this.camera.lookAt(new THREE.Vector3(0, 1.2, 0));

    document.addEventListener("keydown", this.onKeyDown);

    this.gradientComputer = new GradientComputer(this.renderer, this);
    this.laoComputer = new LAOComputer(
      this.renderer,
      this.model,
      this.gradientComputer.getFirstDerivative(),
      this.gradientComputer.getSecondDerivative(),
      this.updateCurrentResolution,
    );

    this.volume = new Volume(
      this,
      this.gradientComputer.getFirstDerivative(),
      this.gradientComputer.getSecondDerivative(),
      this.gradientComputer.getOutputDerivative(),
      this.laoComputer.output,
    );
    // Position the volume in a reasonable height for XR.
    this.volume.position.set(0, 1.2, 0);
    this.scene.add(this.volume);
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
      new THREE.Vector2(this.canvas.width, this.canvas.height),
      this.eagerRender,
      resolutionSteps,
      this.intermediateRenderTarget,
    );

    window.addEventListener("resize", this.resize);
    this.resize();

    // TypeScript doesn't recognize that Stats has a constructor...
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.stats = new (Stats as any)();
    canvas.parentElement?.appendChild(this.stats.dom);
    this.stats.dom.style.right = "0";
    this.stats.dom.style.left = "auto";

    this.disposers.push(
      reaction(() => this.model.image, this.onCameraMove),
      reaction(() => this.model.focus, this.lazyRender),
      reaction(() => this.model.useFocusVolume, this.lazyRender),
      reaction(() => this.model.focusColor, this.lazyRender),
      reaction(() => this.model.lightingMode, this.lazyRender),
      reaction(() => this.model.imageOpacity, this.lazyRender),
      reaction(() => this.model.contextOpacity, this.lazyRender),
      reaction(() => this.model.rangeLimits, this.lazyRender),
      reaction(() => this.model.cutAwayConeAngle, this.lazyRender),
      reaction(() => this.model.customTFTexture, this.lazyRender),
      reaction(() => this.model.transferFunction, this.lazyRender),
      reaction(
        () => this.model.isConeLinkedToCamera,
        (value) => {
          if (value) {
            this.onCameraMove();
          }
        },
      ),
    );

    this.onCameraMove();
    this.renderer.setAnimationLoop(this.animate);
  }

  public dispose = () => {
    this.volume.dispose();
    window.removeEventListener("resize", this.resize);
    this.orbitControls.removeEventListener("change", this.onCameraMove);
    this.orbitControls.dispose();
    this.flyControls.removeEventListener("change", this.onCameraMove);
    this.flyControls.removeEventListener("lock", this.onFlyControlsLock);
    this.flyControls.removeEventListener("unlock", this.onFlyControlsUnlock);
    this.flyControls.dispose();
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("click", this.toggleFly);
    this.gradientComputer.dispose();
    this.laoComputer.dispose();
    this.screenAlignedQuad.dispose();
    this.resolutionComputer.dispose();
    this.renderer.dispose();
    this.intermediateRenderTarget.dispose();
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

  private animate = () => {
    this.gradientComputer.tick();

    if (
      this.model.lightingMode.needsLAO &&
      ((this.resolutionComputer.fullResolutionFlushed &&
        !this.laoComputer.isFinalLAOFlushed) ||
        this.laoComputer.isDirty)
    ) {
      this.laoComputer.tick();
    }

    if (this.lazyRenderTriggered) {
      this.resolutionComputer.restart();
      this.lazyRenderTriggered = false;
    }

    if (!this.resolutionComputer.fullResolutionFlushed) {
      this.resolutionComputer.tick();
    }

    if (this.renderer.xr.isPresenting) {
      this.eagerRender();
    }

    this.stats.update();
    this.flyControls.tick();
  };

  public lazyRender = () => {
    this.lazyRenderTriggered = true;
  };

  private eagerRender = () => {
    if (!this.model.image) return;

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

  private onCameraMove = () => {
    if (
      !this.renderer.xr.isPresenting &&
      ((this.model.lightingMode.type === LightingModeType.LAO &&
        this.model.transferFunction.updateLAOOnCameraMove &&
        this.model.isConeLinkedToCamera) ||
        (this.model.lightingMode.type === LightingModeType.Phong &&
          this.model.transferFunction.updateNormalsOnCameraMove &&
          this.model.isConeLinkedToCamera) ||
        this.model.lightingTimeout)
    ) {
      this.model.onTransferFunctionChange();
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

    this.volume.setCameraPosition(this.workingVector);
    this.gradientComputer.setCameraPosition(this.workingVector);
    this.laoComputer.setCameraPosition(this.workingVector);

    if (this.model.isConeLinkedToCamera) {
      const { x, y, z } = this.workingVector;
      this.model.setCutAwayConeDirection(x, y, z);
    }
  }

  private onFlyControlsLock = () => {
    this.orbitControls.enabled = false;
    document.addEventListener("pointerdown", this.toggleFly);
  };

  private onFlyControlsUnlock = () => {
    this.orbitControls.enabled = true;
    document.removeEventListener("pointerdown", this.toggleFly);

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
  };

  public toggleFly = () => {
    if (this.flyControls.isLocked) {
      this.flyControls.unlock();
    } else {
      this.flyControls.lock();
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "F") {
      this.toggleFly();
    }
  };

  // XR Management
  public async isXRAvailable() {
    if (!("xr" in navigator)) return false;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (navigator as THREE.Navigator).xr!.isSessionSupported(
      "immersive-vr",
    );
  }
  public isInXR() {
    return this.renderer.xr.isPresenting;
  }

  protected onXRSessionEnded = () => {
    const session = this.renderer.xr.getSession();
    if (!session) return;
    session.removeEventListener("end", this.onXRSessionEnded);
  };
  protected onXRSessionStarted = (session: THREE.XRSession) => {
    session.addEventListener("end", this.onXRSessionEnded);
    return this.renderer.xr.setSession(session);
  };

  public async enterXR() {
    if (this.renderer.xr.getSession()) return;
    const sessionInit = { optionalFeatures: ["local-floor"] };
    const session = await (navigator as THREE.Navigator).xr?.requestSession(
      "immersive-vr",
      sessionInit,
    );
    if (!session) return;
    this.onXRSessionStarted(session);
  }

  public async exitXR() {
    const session = this.renderer.xr.getSession();
    if (!session) return;
    return session.end();
  }
}

export default VolumeRenderer;
