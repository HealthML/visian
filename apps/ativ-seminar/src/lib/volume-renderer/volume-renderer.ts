import { TextureAtlas } from "@visian/utils";
import { action, observable } from "mobx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

import { IDisposable } from "../types";
import { FlyControls, ScreenAlignedQuad } from "./utils";
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

  private isImageLoaded = false;

  protected backgroundValueBox = observable.box(0);
  protected imageOpacityBox = observable.box(1);

  constructor(private canvas: HTMLCanvasElement) {
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

    this.volume = new Volume(this);
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

    const url = new URL(window.location.href);
    const sizeLimitParam = url.searchParams.get("sizeLimit");
    const sizeLimit = sizeLimitParam
      ? parseInt(sizeLimitParam)
      : Math.max(window.innerHeight, window.innerWidth);

    let renderTargetWidth, renderTargetHeight;
    if (aspect >= 1) {
      renderTargetWidth = Math.min(sizeLimit, window.innerWidth);
      renderTargetHeight = Math.round(renderTargetWidth / aspect);
    } else {
      renderTargetHeight = Math.min(sizeLimit, window.innerHeight);
      renderTargetWidth = Math.round(renderTargetHeight * aspect);
    }
    this.intermediateRenderTarget.setSize(
      renderTargetWidth,
      renderTargetHeight,
    );

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.eagerRender();
  };

  private animate = () => {
    if (this.lazyRenderTriggered || this.renderer.xr.isPresenting) {
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
    this.lazyRenderTriggered = false;

    if (this.renderer.xr.isPresenting) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    } else {
      this.renderer.setRenderTarget(this.intermediateRenderTarget);
      this.renderer.render(this.scene, this.camera);

      this.renderer.setRenderTarget(null);
      this.screenAlignedQuad.renderWith(this.renderer);
    }
  };

  private onCameraMove = () => {
    this.volume.updateCameraPosition(this.camera);
    this.lazyRender();
  };

  /** Sets the base image to be rendered. */
  public setImage = (image: TextureAtlas) => {
    this.volume.setAtlas(image);
    this.isImageLoaded = true;

    // TODO: Can we maybe find a solution that does not require
    // double-rendering for the initial frame?
    this.eagerRender();
    this.onCameraMove();
  };

  /** Sets a focus volume. */
  public setFocus = (focus?: TextureAtlas) => {
    this.volume.setFocusAtlas(focus);
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
  public get backgroundValue() {
    return this.backgroundValueBox.get();
  }
  public setBackgroundValue = action((value: number) => {
    this.backgroundValueBox.set(Math.max(0, Math.min(1, value)));
  });

  public get imageOpacity() {
    return this.imageOpacityBox.get();
  }
  public setImageOpacity = action((value: number) => {
    this.imageOpacityBox.set(Math.max(0, Math.min(1, value)));
    this.lazyRender();
  });

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
