import { action, computed, makeObservable, observable } from "mobx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import tc from "tinycolor2";

import { TextureAtlas } from "../texture-atlas";
import { IDisposable } from "../types";
import {
  FlyControls,
  generateHistogram,
  LightingMode,
  lightingModes,
  LightingModeType,
  ResolutionComputer,
  ScreenAlignedQuad,
} from "./utils";
import {
  TransferFunction,
  transferFunctions,
  TransferFunctionType,
} from "./utils/transfer-function";
import Volume from "./volume";
import VolumeMaterial from "./volume-material";

export class VolumeRenderer implements IDisposable {
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

  public isImageLoaded = false;
  public densityHistogram?: [number[], number, number];
  public gradientHistogram?: [number[], number, number];

  private lightingTimeout?: NodeJS.Timer;
  private suppressedLightingMode?: LightingMode;

  private resolutionComputer: ResolutionComputer;

  public backgroundValue = 0;
  public shouldUseFocusVolume = false;
  public focusColor = "#ffffff";
  public transferFunction = transferFunctions[TransferFunctionType.FCEdges];
  public lightingMode = lightingModes[LightingModeType.LAO];
  public laoIntensity = 1;
  public imageOpacity = 1;
  public contextOpacity = 0.4;
  public densityRangeLimits: [number, number] = [0, 1];
  public edgeRangeLimits: [number, number] = [0.1, 1];
  public rangeLimits: [number, number] = this.edgeRangeLimits;
  public cutAwayConeAngle = 1;
  public customTFTexture?: THREE.Texture;
  public isFocusLoaded = false;

  constructor(private canvas: HTMLCanvasElement) {
    makeObservable<this, "setCustomTFTexture" | "setFocusLoaded">(this, {
      isImageLoaded: observable,
      densityHistogram: observable.ref,
      gradientHistogram: observable.ref,
      backgroundValue: observable,
      shouldUseFocusVolume: observable,
      focusColor: observable,
      transferFunction: observable,
      lightingMode: observable,
      laoIntensity: observable,
      imageOpacity: observable,
      contextOpacity: observable,
      rangeLimits: observable,
      cutAwayConeAngle: observable,
      customTFTexture: observable.ref,
      isFocusLoaded: observable,
      setImage: action,
      setGradientHistogram: action,
      setBackgroundValue: action,
      setShouldUseFocusVolume: action,
      setFocusColor: action,
      setTransferFunction: action,
      setLightingMode: action,
      setLaoIntensity: action,
      setImageOpacity: action,
      setContextOpacity: action,
      setRangeLimits: action,
      setCutAwayConeAngle: action,
      setCustomTFTexture: action,
      setFocusLoaded: action,
    });

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

    this.volume = new Volume(this, this.renderer);
    // Position the volume in a reasonable height for XR.
    this.volume.position.set(0, 1.2, 0);
    this.scene.add(this.volume);
    this.volume.onBeforeRender = (_renderer, _scene, camera) => {
      if (this.renderer.xr.isPresenting) {
        this.volume.updateCameraPosition(camera);
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
      : 1;
    this.resolutionComputer = new ResolutionComputer(
      this.renderer,
      this.scene,
      this.camera,
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
  };

  private resize = () => {
    const aspect = window.innerWidth / window.innerHeight;

    this.resolutionComputer.setTargetSize(
      window.innerWidth,
      window.innerHeight,
    );

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.lazyRender();
  };

  private animate = () => {
    this.volume.tick();

    if (this.lazyRenderTriggered) {
      this.resolutionComputer.restart();
      this.lazyRenderTriggered = false;
    }

    this.resolutionComputer.tick();

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
    if (!this.isImageLoaded) return;

    this.renderer.setRenderTarget(null);
    if (this.renderer.xr.isPresenting) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.screenAlignedQuad.renderWith(this.renderer);
    }
  };

  public updateCurrentResolution() {
    this.resolutionComputer.updateCurrentResolution();
  }

  public get isShowingFullResolution() {
    return this.resolutionComputer.fullResolutionFlushed;
  }

  private onCameraMove = () => {
    if (
      !this.renderer.xr.isPresenting &&
      ((this.lightingMode.type === LightingModeType.LAO &&
        this.transferFunction.updateLAOOnCameraMove) ||
        (this.lightingMode.type === LightingModeType.Phong &&
          this.transferFunction.updateNormalsOnCameraMove) ||
        this.lightingTimeout)
    ) {
      this.onTransferFunctionChange();
    }

    this.volume.updateMatrixWorld();
    this.volume.updateCameraPosition(this.camera);
    this.lazyRender();
  };

  private onTransferFunctionChange = () => {
    if (!this.suppressedLightingMode) {
      this.suppressedLightingMode = this.lightingMode;
      this.setLightingMode(lightingModes[LightingModeType.None]);
    }

    if (this.lightingTimeout) {
      clearTimeout(this.lightingTimeout);
    }
    this.lightingTimeout = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.setLightingMode(this.suppressedLightingMode!);
      this.suppressedLightingMode = undefined;
      this.lightingTimeout = undefined;
    }, 200);

    this.lazyRender();
  };

  /** Sets the base image to be rendered. */
  public setImage = (image: TextureAtlas) => {
    this.onTransferFunctionChange();

    this.volume.setAtlas(image);
    this.isImageLoaded = true;
    this.densityHistogram = generateHistogram(image.getAtlas());
    this.setShouldUseFocusVolume(false);

    this.onCameraMove();
  };

  /** Sets a focus volume. */
  public setFocus = (focus?: TextureAtlas) => {
    this.onTransferFunctionChange();

    this.volume.setFocusAtlas(focus);
    this.setShouldUseFocusVolume(Boolean(focus));
    this.setFocusLoaded(Boolean(focus));
    this.lazyRender();
  };

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

  // User-defined rendering parameters
  public setGradientHistogram(histogram: [number[], number, number]) {
    this.gradientHistogram = histogram;
  }

  @computed
  public get backgroundColor() {
    return `rgb(${this.backgroundValue * 255},${this.backgroundValue * 255},${
      this.backgroundValue * 255
    })`;
  }
  public setBackgroundValue = (value: number) => {
    this.backgroundValue = Math.max(0, Math.min(1, value));
  };

  public setShouldUseFocusVolume = (shouldUseFocusVolume: boolean) => {
    this.shouldUseFocusVolume = shouldUseFocusVolume;
    this.lazyRender();
  };

  public setFocusColor = (value: string) => {
    try {
      this.focusColor = tc(value).toRgbString();
      this.lazyRender();
    } catch {
      // Intentionally left blank
    }
  };

  public setTransferFunction = (value: TransferFunction) => {
    this.onTransferFunctionChange();

    if (this.transferFunction.type === TransferFunctionType.Density) {
      this.densityRangeLimits = this.rangeLimits;
    } else if (this.transferFunction.type === TransferFunctionType.FCEdges) {
      this.edgeRangeLimits = this.rangeLimits;
    }

    this.transferFunction = value;
    this.laoIntensity = value.defaultLAOIntensity;

    if (this.transferFunction.type === TransferFunctionType.Density) {
      this.rangeLimits = this.densityRangeLimits;
    } else if (this.transferFunction.type === TransferFunctionType.FCEdges) {
      this.rangeLimits = this.edgeRangeLimits;
    }

    this.lazyRender();
  };

  public setLightingMode = (value: LightingMode) => {
    this.lightingMode = value;

    if (value.type === LightingModeType.LAO) {
      this.laoIntensity = this.transferFunction.defaultLAOIntensity;
    }

    this.lazyRender();
  };

  public setLaoIntensity = (value: number) => {
    this.laoIntensity = Math.max(0, value);
  };

  public setImageOpacity = (value: number) => {
    this.imageOpacity = Math.max(0, Math.min(1, value));
    this.lazyRender();
  };

  public setContextOpacity = (value: number) => {
    this.onTransferFunctionChange();

    this.contextOpacity = Math.max(0, Math.min(1, value));
    this.lazyRender();
  };

  public setRangeLimits = (value: [number, number]) => {
    this.onTransferFunctionChange();

    this.rangeLimits = [
      Math.max(0, Math.min(1, value[0])),
      Math.max(0, Math.min(1, value[1])),
    ];
    this.lazyRender();
  };

  public setCutAwayConeAngle = (radians: number) => {
    this.onTransferFunctionChange();

    this.cutAwayConeAngle = radians;
    this.lazyRender();
  };

  protected setCustomTFTexture(texture: THREE.Texture) {
    this.customTFTexture = texture;
    this.lazyRender();
  }
  public setCustomTFImage = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        new THREE.TextureLoader().load(reader.result as string, (texture) => {
          this.setCustomTFTexture(texture);
        });
      },
      false,
    );

    reader.readAsDataURL(file);
  };

  protected setFocusLoaded(value: boolean) {
    this.isFocusLoaded = value;
  }

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
