import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

export class FlyControls extends PointerLockControls {
  private direction = new THREE.Vector3();

  private pressedKeys: { [key: string]: boolean } = {};
  private continuousCallbacks: { keys: string[]; callback: () => void }[];

  private changeEvent = { type: "change" };

  constructor(
    private camera: THREE.Camera,
    domElement: HTMLElement,
    public speed = 0.005,
  ) {
    super(camera, domElement);

    this.continuousCallbacks = [
      {
        keys: ["w"],
        callback: this.moveForward,
      },
      {
        keys: ["a"],
        callback: this.moveLeft,
      },
      {
        keys: ["s"],
        callback: this.moveBack,
      },
      {
        keys: ["d"],
        callback: this.moveRight,
      },
      {
        keys: ["shift"],
        callback: this.moveDown,
      },
      {
        keys: [" "],
        callback: this.moveUp,
      },
    ];

    this.addEventListener("lock", this.onSuccessfulLock);
    this.addEventListener("unlock", this.onSuccessfulUnlock);
  }

  public dispose() {
    super.dispose();
    this.addEventListener("lock", this.onSuccessfulLock);
    this.addEventListener("unlock", this.onSuccessfulUnlock);
    this.onSuccessfulUnlock();
  }

  public tick = () => {
    this.continuousCallbacks.forEach((shortcut) => {
      if (shortcut.keys.every((key) => this.pressedKeys[key])) {
        shortcut.callback();
      }
    });
  };

  public moveForward = () => {
    if (!this.isLocked) return;

    this.camera.getWorldDirection(this.direction);
    this.camera.position.addScaledVector(this.direction, this.speed);

    this.dispatchEvent(this.changeEvent);
  };

  public moveBack = () => {
    if (!this.isLocked) return;

    this.camera.getWorldDirection(this.direction);
    this.camera.position.addScaledVector(this.direction, -this.speed);
    this.dispatchEvent(this.changeEvent);
  };

  public moveUp = () => {
    if (!this.isLocked) return;

    this.camera.position.addScaledVector(this.camera.up, this.speed);
    this.dispatchEvent(this.changeEvent);
  };

  public moveDown = () => {
    if (!this.isLocked) return;

    this.camera.position.addScaledVector(this.camera.up, -this.speed);
    this.dispatchEvent(this.changeEvent);
  };

  public moveLeft = () => {
    if (!this.isLocked) return;

    this.direction.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.direction, -this.speed);

    this.dispatchEvent(this.changeEvent);
  };

  public moveRight = () => {
    if (!this.isLocked) return;

    this.direction.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.direction, this.speed);

    this.dispatchEvent(this.changeEvent);
  };

  private onSuccessfulLock = () => {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  };

  private onSuccessfulUnlock = () => {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase();
    this.pressedKeys[pressedKey] = true;

    // Prevent scrolling when hitting space
    if (pressedKey === " ") {
      event.preventDefault();
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys[event.key.toLowerCase()] = false;
  };
}
