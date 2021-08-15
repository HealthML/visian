import { IEditor, IVolumeRenderer, IXRManager } from "@visian/ui-shared";
import * as THREE from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";

import { VolumeMaterial } from "./volume-material";

export class XRManager implements IXRManager {
  public xrWorld?: THREE.Group;

  constructor(protected renderer: IVolumeRenderer, protected editor: IEditor) {
    // DEBUG
    (this.renderer.volume.material as VolumeMaterial).setVolumetricOcclusion(
      true,
    );
    this.setupXRWorld();
  }

  protected startGrab = (controller: THREE.Group) => {
    controller.attach(this.renderer.volume);
    this.renderer.volume.userData.selections =
      (this.renderer.volume.userData.selections || 0) + 1;
    controller.userData.selected = this.renderer.volume;
  };
  protected endGrab = (controller: THREE.Group) => {
    if (controller.userData.selected !== undefined) {
      const object = controller.userData.selected;
      object.userData.selections =
        (this.renderer.volume.userData.selections || 1) - 1;
      controller.userData.selected = undefined;
      if (!object.userData.selections) {
        this.renderer.scene.attach(object);
      }
    }
  };

  public animate() {
    const session = this.renderer.renderer.xr.getSession();
    if (!session) return;

    const transferFunction = this.editor.activeDocument?.viewport3D
      .activeTransferFunction;
    session.inputSources.forEach((source, index) => {
      const controller = this.renderer.renderer.xr.getController(index);

      // Grabbing
      if (controller.userData.selected) {
        if (
          source.gamepad.buttons[1].value < controller.userData.lastSqueezeValue
        ) {
          this.endGrab(controller);
        }
      } else if (
        source.gamepad.buttons[1].value > controller.userData.lastSqueezeValue
      ) {
        this.startGrab(controller);
      }
      controller.userData.lastSqueezeValue = source.gamepad.buttons[1].value;

      const stickThreshold = 0.01;
      const maxSliderSpeed = 0.01;
      switch (source.handedness) {
        case "left":
          // Axes (Thumb Stick)
          // 2: Left to right
          // 3: Top to bottom

          if (
            transferFunction?.name === "density" ||
            transferFunction?.name === "fc-edges"
          ) {
            if (Math.abs(source.gamepad.axes[2]) > stickThreshold) {
              const [low, high] = transferFunction.params.densityRange
                .value as [number, number];
              transferFunction.params.densityRange.setValue([
                Math.min(
                  Math.max(0, low + maxSliderSpeed * source.gamepad.axes[2]),
                  high,
                ),
                high,
              ]);
            }
          }

          // Buttons
          // 0: Trigger
          // 1: Squeeze
          // 3: Gamepad
          // 4: X
          // 5: Y

          if (
            source.gamepad.buttons[4].pressed &&
            !controller.userData.isXPressed
          ) {
            this.editor.activeDocument?.viewport3D.cycleActiveTransferFunction();
          }
          controller.userData.isXPressed = source.gamepad.buttons[4].pressed;

          if (
            source.gamepad.buttons[5].pressed &&
            !controller.userData.isYPressed
          ) {
            this.editor.activeDocument?.viewport3D.cycleShadingMode();
          }
          controller.userData.isYPressed = source.gamepad.buttons[5].pressed;

          break;
        case "right":
          // Axes (Thumb Stick)
          // 2: Left to right
          // 3: Top to bottom

          if (
            transferFunction?.name === "density" ||
            transferFunction?.name === "fc-edges"
          ) {
            if (Math.abs(source.gamepad.axes[2]) > stickThreshold) {
              const [low, high] = transferFunction.params.densityRange
                .value as [number, number];
              transferFunction.params.densityRange.setValue([
                low,
                Math.min(
                  Math.max(low, high + maxSliderSpeed * source.gamepad.axes[2]),
                  1,
                ),
              ]);
            }
          }

          // Buttons
          // 0: Trigger
          // 1: Squeeze
          // 3: Gamepad
          // 4: A
          // 5: B
          break;
      }
    });
  }

  protected setupXRController(
    id: number,
    controllerModelFactory = new XRControllerModelFactory(),
  ) {
    if (!this.xrWorld) return;

    const controllerGrip = this.renderer.renderer.xr.getControllerGrip(id);
    const model = controllerModelFactory.createControllerModel(controllerGrip);
    controllerGrip.add(model);
    this.xrWorld.add(controllerGrip);

    const controller = this.renderer.renderer.xr.getController(id);
    this.xrWorld.add(controller);
  }
  protected setupXRWorld(): void {
    if (this.xrWorld) return;
    this.xrWorld = new THREE.Group();

    // Controllers
    const controllerModelFactory = new XRControllerModelFactory();
    this.setupXRController(0, controllerModelFactory);
    this.setupXRController(1, controllerModelFactory);

    // Floor
    this.xrWorld.add(new THREE.GridHelper(5, 10, 0x404040, 0x404040));

    // DEBUG
    this.xrWorld.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 32, 16),
        new THREE.MeshBasicMaterial({ color: 0x111100 }),
      ).translateY(1.2),
    );

    // Mount to Scene
    this.renderer.scene.add(this.xrWorld);
  }

  protected destroyXRWorld(): void {
    if (!this.xrWorld) return;
    this.renderer.scene.remove(this.xrWorld);
    this.xrWorld = undefined;
  }

  public isInXR() {
    return this.renderer.renderer.xr.isPresenting;
  }

  protected onXRSessionEnded = () => {
    this.editor.activeDocument?.viewport3D.setIsInXR(false);
    this.renderer.renderer.xr.removeEventListener(
      "sessionend",
      this.onXRSessionEnded,
    );
    this.destroyXRWorld();
    this.renderer.resize();
    this.renderer.resetScene(true);
  };
  protected onXRSessionStarted = (session: THREE.XRSession) => {
    this.editor.activeDocument?.viewport3D.setIsInXR(true);
    this.renderer.renderer.xr.setSession(session);
    this.renderer.renderer.xr.addEventListener(
      "sessionend",
      this.onXRSessionEnded,
    );
    this.setupXRWorld();
  };

  public enterXR = async () => {
    if (this.isInXR()) return;

    this.editor.activeDocument?.viewport3D.transferFunctions[
      "fc-cone"
    ].params.isConeLocked.setValue(true);

    (this.renderer.volume.material as VolumeMaterial).setUseRayDithering(false);

    const sessionInit = { optionalFeatures: ["local-floor"] };
    const session = await (navigator as THREE.Navigator).xr?.requestSession(
      "immersive-vr",
      sessionInit,
    );
    if (!session) return;
    this.onXRSessionStarted(session);
  };

  public exitXR = async () => {
    const session = this.renderer.renderer.xr.getSession();
    if (!session) return;

    (this.renderer.volume.material as VolumeMaterial).setUseRayDithering(true);

    return session.end();
  };
}
