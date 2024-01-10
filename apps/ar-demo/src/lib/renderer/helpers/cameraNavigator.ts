import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import SpriteHandler from "./spriteHandler";
import { Renderer } from "..";
import { IDisposable } from "../../types";
import { getIntersections } from "../../utils";
import createOrbitControls from "../creators/orbitControls";

export default class CameraNavigator implements IDisposable {
  private camera: THREE.PerspectiveCamera;

  private direction = new THREE.Vector3();

  public speed = 0.004;

  private pointerControls: PointerLockControls;
  private orbitControls: OrbitControls;

  constructor(
    private renderer: Renderer,
    private canvas: HTMLCanvasElement,
    private spriteHandler: SpriteHandler,
    private cameraLight: THREE.DirectionalLight,
    canvasContainer: HTMLDivElement,
  ) {
    this.camera = renderer.camera;

    this.pointerControls = new PointerLockControls(
      this.camera,
      canvasContainer,
    );
    this.pointerControls.addEventListener("change", this.onCameraMove);
    this.pointerControls.addEventListener("lock", this.onPointerLocked);
    this.pointerControls.addEventListener("unlock", this.onPointerUnlocked);

    const target = this.renderer.scanOffsetGroup.localToWorld(
      this.spriteHandler.spriteGroup.position.clone(),
    );
    this.orbitControls = createOrbitControls(
      this.renderer.camera,
      canvas,
      target,
    );

    this.orbitControls.addEventListener("change", this.onCameraMove);
    this.orbitControls.addEventListener(
      "change",
      this.spriteHandler.updateRenderOrder,
    );

    this.canvas.addEventListener("wheel", this.handleWheel);

    this.spriteHandler.updateRenderOrder();
  }

  public dispose = () => {
    if (this.isPointerLocked) this.togglePointerLock();
    this.pointerControls.removeEventListener("change", this.onCameraMove);
    this.pointerControls.removeEventListener("lock", this.onPointerLocked);
    this.pointerControls.removeEventListener("unlock", this.onPointerUnlocked);
    this.pointerControls.dispose();

    this.orbitControls.removeEventListener("change", this.onCameraMove);
    this.orbitControls.removeEventListener(
      "change",
      this.spriteHandler.updateRenderOrder,
    );
    this.orbitControls.dispose();

    this.canvas.removeEventListener("wheel", this.handleWheel);
  };

  public get isPointerLocked() {
    return this.pointerControls.isLocked;
  }

  public disableOrbitControls = () => {
    this.orbitControls.enabled = false;
  };

  public enableOrbitControls = () => {
    this.orbitControls.enabled = true;
  };

  private getCameraTarget = () => {
    const targetPoint = new THREE.Vector3().copy(this.camera.position);
    this.camera.getWorldDirection(this.direction);
    targetPoint.addScaledVector(this.direction, 0.15);
    return targetPoint;
  };

  private onCameraMove = () => {
    this.cameraLight.position.copy(this.camera.position);

    const targetPosition = this.getCameraTarget();
    this.cameraLight.target.position.copy(targetPosition);

    this.renderer.render();
  };

  public updateOrbitTarget = () => {
    const screenCenter = { x: 0, y: 0 };
    const objects = [
      ...this.renderer.annotation.structures,
      ...this.spriteHandler.spriteParts,
    ];
    const intersections = getIntersections(
      screenCenter,
      objects,
      this.renderer.camera,
    );
    if (intersections.length) {
      const intersectionPoint = intersections[0].point;
      this.orbitControls.target = intersectionPoint;
    } else {
      const targetPoint = this.getCameraTarget();
      this.orbitControls.target = targetPoint;
    }
  };

  public setSpeed = (speed: number) => {
    this.speed = speed;
  };

  public moveForward = () => {
    this.camera.getWorldDirection(this.direction);
    this.camera.position.addScaledVector(this.direction, this.speed);

    this.spriteHandler.updateRenderOrder();
  };

  public moveBack = () => {
    this.camera.getWorldDirection(this.direction);
    this.camera.position.addScaledVector(this.direction, -this.speed);

    this.spriteHandler.updateRenderOrder();
  };

  public moveUp = () => {
    if (!this.isPointerLocked) return;
    this.camera.position.addScaledVector(this.camera.up, this.speed);

    this.spriteHandler.updateRenderOrder();
  };

  public moveDown = () => {
    if (!this.isPointerLocked) return;
    this.camera.position.addScaledVector(this.camera.up, -this.speed);

    this.spriteHandler.updateRenderOrder();
  };

  public moveLeft = () => {
    if (!this.isPointerLocked) return;
    this.pointerControls.moveRight(-this.speed);

    this.spriteHandler.updateRenderOrder();
  };

  public moveRight = () => {
    if (!this.isPointerLocked) return;
    this.pointerControls.moveRight(this.speed);

    this.spriteHandler.updateRenderOrder();
  };

  public togglePointerLock = () => {
    try {
      if (this.isPointerLocked) {
        this.pointerControls.unlock();
      } else {
        this.pointerControls.lock();
      }
    } catch {
      // no-op
    }
  };

  private onPointerLocked = () => {
    this.disableOrbitControls();
    this.canvas.removeEventListener("wheel", this.handleWheel);
    document.addEventListener("wheel", this.handleWheel);

    // The lock event is fired before the isLocked property of the controls is
    // changed. We wait a few ms for isLocked to be updated before updating the UI.
    setTimeout(() => {
      this.renderer.updateUI();
    }, 5);
  };

  private onPointerUnlocked = () => {
    this.enableOrbitControls();
    this.updateOrbitTarget();
    document.removeEventListener("wheel", this.handleWheel);
    this.canvas.addEventListener("wheel", this.handleWheel);

    // The lock event is fired before the isLocked property of the controls is
    // changed. We wait a few ms for isLocked to be updated before updating the UI.
    setTimeout(() => {
      this.renderer.updateUI();
    }, 5);
  };

  private handleWheel = (event: WheelEvent) => {
    // Block wheel events from reaching the orbit controls.
    // We don't want to disable zoom completely to keep it on touch devices.
    event.stopPropagation();
  };
}
