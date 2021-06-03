import {
  IConeTransferFunction,
  IEditor,
  IImageLayer,
  ILayerParameter,
  IVolumeRenderer,
} from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { ScreenAlignedQuad } from "../screen-aligned-quad";
import {
  LAOComputer,
  FlyControls,
  GradientComputer,
  ResolutionComputer,
  SharedUniforms,
} from "./utils";
import { VolumeMaterial } from "./volume-material";
import { Volume } from "./volume";

export class VolumeRenderer implements IVolumeRenderer, IDisposable {
  private sharedUniforms: SharedUniforms;

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
    this.orbitControls.target.set(0, 1.2, 0);
    this.orbitControls.addEventListener("change", this.onCameraMove);

    this.flyControls = new FlyControls(this.camera, this.renderer.domElement);
    this.flyControls.addEventListener("change", () => this.onCameraMove());
    this.flyControls.addEventListener("lock", this.onFlyControlsLock);
    this.flyControls.addEventListener("unlock", this.onFlyControlsUnlock);

    const matrix = editor.activeDocument?.viewport3D.cameraMatrix;
    if (matrix) this.camera.applyMatrix4(matrix);
    this.camera.updateMatrixWorld();

    document.addEventListener("keydown", this.onKeyDown);

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
          return (editor.activeDocument!.getLayer(layerId) as IImageLayer)
            .image;
        },

        () => this.onCameraMove(false),
      ),
      reaction(() => {
        const annotationLayerParameter =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .annotation;
        const layerId = annotationLayerParameter
          ? (annotationLayerParameter as ILayerParameter).value
          : undefined;
        const annotationLayer = layerId
          ? editor.activeDocument?.getLayer(layerId)
          : undefined;
        const annotation = annotationLayer
          ? (annotationLayer as IImageLayer).image
          : undefined;

        const transferFunction =
          editor.activeDocument?.viewport3D.activeTransferFunction;

        return [
          annotation,
          annotationLayer?.color,

          editor.activeDocument?.viewSettings.viewMode,
          editor.activeDocument?.viewSettings.brightness,
          editor.activeDocument?.viewport3D.shadingMode,
          editor.activeDocument?.viewport3D.opacity,
          transferFunction?.name,
          transferFunction?.params.useFocus?.value,
          transferFunction?.params.densityRange?.value,
          transferFunction?.params.contextOpacity?.value,
          transferFunction?.params.focusOpacity?.value,
          transferFunction?.params.coneAngle?.value,
          transferFunction?.params.file?.value,

          transferFunction?.name === "fc-cone"
            ? (transferFunction as IConeTransferFunction).coneDirection.toArray()
            : undefined,
        ];
      }, this.lazyRender),
      autorun(() => {
        switch (editor.activeDocument?.viewSettings.viewMode) {
          case "2D":
            if (this.flyControls.isLocked) this.flyControls.unlock();
            this.orbitControls.enabled = false;
            break;
          case "3D":
            this.orbitControls.enabled = !this.flyControls.isLocked;
        }
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
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("click", this.toggleFly);
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
    this.editor.activeDocument?.viewport3D.setIsInXR(false);
    const session = this.renderer.xr.getSession();
    if (!session) return;
    session.removeEventListener("end", this.onXRSessionEnded);
  };
  protected onXRSessionStarted = (session: THREE.XRSession) => {
    this.editor.activeDocument?.viewport3D.setIsInXR(true);
    session.addEventListener("end", this.onXRSessionEnded);
    return this.renderer.xr.setSession(session);
  };

  public async enterXR() {
    if (this.renderer.xr.getSession()) return;

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
  }

  public async exitXR() {
    const session = this.renderer.xr.getSession();
    if (!session) return;
    return session.end();
  }
}
