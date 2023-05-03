import { IEditor, IPreviewedTool, IXRManager } from "@visian/ui-shared";
import * as THREE from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";

import { VolumeRenderer } from "./volume-renderer";

export class XRManager implements IXRManager {
  public xrWorld?: THREE.Group;

  constructor(protected renderer: VolumeRenderer, protected editor: IEditor) {}

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

    const transferFunction =
      this.editor.activeDocument?.viewport3D.activeTransferFunction;
    session.inputSources.forEach((source, index) => {
      if (!source.gamepad) return;
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

          if (Math.abs(source.gamepad.axes[2]) > stickThreshold) {
            if (
              this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
                .holdsPreview
            ) {
              const [low, high] =
                this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
                  .threshold || [];
              this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D.setThreshold(
                [
                  Math.min(
                    Math.max(0, low + maxSliderSpeed * source.gamepad.axes[2]),
                    high,
                  ),
                  high,
                ],
              );
              this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D.render();
            } else if (
              transferFunction?.name === "density" ||
              transferFunction?.name === "fc-edges"
            ) {
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

          if (Math.abs(source.gamepad.axes[2]) > stickThreshold) {
            if (
              this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
                .holdsPreview
            ) {
              const [low, high] =
                this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
                  .threshold || [];
              this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D.setThreshold(
                [
                  low,
                  Math.min(
                    Math.max(
                      low,
                      high + maxSliderSpeed * source.gamepad.axes[2],
                    ),
                    1,
                  ),
                ],
              );
              this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D.render();
            } else if (
              this.editor.activeDocument?.tools.dilateErodeRenderer3D
                .holdsPreview
            ) {
              if (!controller.userData.isRightStickPressed) {
                const steps =
                  (this.editor.activeDocument?.tools.dilateErodeRenderer3D
                    .maxSteps || 1) *
                    (this.editor.activeDocument?.tools.dilateErodeRenderer3D
                      .shouldErode
                      ? -1
                      : 1) +
                  Math.sign(source.gamepad.axes[2]);
                this.editor.activeDocument?.tools.dilateErodeRenderer3D.setShouldErode(
                  steps < 0,
                );
                this.editor.activeDocument?.tools.dilateErodeRenderer3D.setMaxSteps(
                  Math.abs(steps),
                );
                this.editor.activeDocument?.tools.dilateErodeRenderer3D.render();
              }
            } else if (
              transferFunction?.name === "density" ||
              transferFunction?.name === "fc-edges"
            ) {
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
          controller.userData.isRightStickPressed =
            Math.abs(source.gamepad.axes[2]) > stickThreshold;

          // Buttons
          // 0: Trigger
          // 1: Squeeze
          // 3: Gamepad
          // 4: A
          // 5: B

          if (
            source.gamepad.buttons[3].pressed &&
            !controller.userData.isRightPadPressed
          ) {
            if (
              this.editor.activeDocument?.tools.dilateErodeRenderer3D
                .holdsPreview
            ) {
              this.editor.activeDocument?.tools.dilateErodeRenderer3D.setShouldAutoCompensate(
                !this.editor.activeDocument?.tools.dilateErodeRenderer3D
                  .shouldAutoCompensate,
              );
            }
          }
          controller.userData.isRightPadPressed =
            source.gamepad.buttons[3].pressed;

          if (
            source.gamepad.buttons[4].pressed &&
            !controller.userData.isAPressed
          ) {
            if (
              this.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
                .holdsPreview
            ) {
              (
                this.editor.activeDocument?.tools.tools[
                  "threshold-annotation"
                ] as IPreviewedTool<string>
              ).submit();
            } else {
              this.editor.activeDocument?.tools.setActiveTool(
                "threshold-annotation",
              );
            }
          }
          controller.userData.isAPressed = source.gamepad.buttons[4].pressed;

          if (
            source.gamepad.buttons[5].pressed &&
            !controller.userData.isBPressed
          ) {
            if (
              this.editor.activeDocument?.tools.dilateErodeRenderer3D
                .holdsPreview
            ) {
              (
                this.editor.activeDocument?.tools.tools[
                  "dilate-erode"
                ] as IPreviewedTool<string>
              ).submit();
            } else {
              this.editor.activeDocument?.tools.setActiveTool("dilate-erode");
            }
          }
          controller.userData.isBPressed = source.gamepad.buttons[5].pressed;

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
  protected onXRSessionStarted = (session: XRSession) => {
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

    this.renderer.volume.mainMaterial.setUseRayDithering(false);

    const sessionInit = { optionalFeatures: ["local-floor"] };
    const session = await navigator.xr?.requestSession(
      "immersive-vr",
      sessionInit,
    );
    if (!session) return;
    this.onXRSessionStarted(session);
  };

  public exitXR = async () => {
    const session = this.renderer.renderer.xr.getSession();
    if (!session) return;

    this.renderer.volume.mainMaterial.setUseRayDithering(true);

    return session.end();
  };
}
