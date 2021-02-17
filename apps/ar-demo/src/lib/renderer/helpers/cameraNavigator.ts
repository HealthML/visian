import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import { Renderer } from "..";
import * as SCAN from "../../staticScan";
import { IDisposable, ViewType } from "../../types";
import {
  getIntersections,
  getIntersectionsFromClickPosition,
} from "../../utils";
import createOrbitControls from "../creators/orbitControls";
import SpriteHandler from "./spriteHandler";

export default class CameraNavigator implements IDisposable {
  private camera: THREE.PerspectiveCamera;

  private direction = new THREE.Vector3();

  private lastMouseEvent?: MouseEvent;

  public speed = 0.004;

  private pointerControls: PointerLockControls;
  private orbitControls: OrbitControls;
  private transformControls: TransformControls;

  private transformObject: THREE.Object3D;

  private workingVector = new THREE.Vector3();
  private voxelDimensions = new THREE.Vector3(
    SCAN.voxelDimensions.x,
    SCAN.voxelDimensions.y,
    SCAN.voxelDimensions.z,
  );
  private minSelectedVoxel = new THREE.Vector3();
  private maxSelectedVoxel = new THREE.Vector3(
    SCAN.voxelCount.x - 1,
    SCAN.voxelCount.y - 1,
    SCAN.voxelCount.z - 1,
  );

  constructor(
    private renderer: Renderer,
    private canvas: HTMLCanvasElement,
    private spriteHandler: SpriteHandler,
    private cameraLight: THREE.DirectionalLight,
    canvasContainer: HTMLDivElement,
  ) {
    this.camera = renderer.camera;
    document.addEventListener("mousemove", this.saveMouseEvent);

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

    this.transformObject = new THREE.Object3D();
    this.transformObject.position.copy(this.spriteHandler.spriteGroup.position);
    this.renderer.scanOffsetGroup.add(this.transformObject);

    this.transformControls = new TransformControls(this.camera, canvas);
    this.transformControls.attach(this.transformObject);
    this.transformControls.setSpace("local");

    renderer.scene.add(this.transformControls);

    this.transformControls.addEventListener(
      "mouseDown",
      this.disableOrbitControls,
    );
    this.transformControls.addEventListener(
      "mouseUp",
      this.enableOrbitControls,
    );
    this.transformControls.addEventListener(
      "objectChange",
      this.handleTransformMove,
    );

    this.canvas.addEventListener("wheel", this.handleWheel);

    this.toggleTransformControls();

    this.spriteHandler.updateRenderOrder();
  }

  public dispose = () => {
    document.removeEventListener("mousemove", this.saveMouseEvent);

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

    this.transformControls.removeEventListener(
      "mouseDown",
      this.disableOrbitControls,
    );
    this.transformControls.removeEventListener(
      "mouseUp",
      this.enableOrbitControls,
    );
    this.transformControls.removeEventListener(
      "objectChange",
      this.handleTransformMove,
    );
    this.transformControls.dispose();

    this.canvas.removeEventListener("wheel", this.handleWheel);
  };

  public get isPointerLocked() {
    return this.pointerControls.isLocked;
  }

  private disableOrbitControls = () => {
    this.orbitControls.enabled = false;
  };

  private enableOrbitControls = () => {
    this.orbitControls.enabled = true;
    this.updateOrbitTarget();
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

  private saveMouseEvent = (event: MouseEvent) => {
    this.lastMouseEvent = event;
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
    document.removeEventListener("wheel", this.handleWheel);
    this.canvas.addEventListener("wheel", this.handleWheel);

    // The lock event is fired before the isLocked property of the controls is
    // changed. We wait a few ms for isLocked to be updated before updating the UI.
    setTimeout(() => {
      this.renderer.updateUI();
    }, 5);
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    // Block wheel events from reaching the orbit controls.
    // We don't want to disable zoom completely to keep it on touch devices.
    event.stopPropagation();

    if (event.deltaY > 0) {
      this.increaseSpritePosition();
    } else if (event.deltaY < 0) {
      this.decreaseSpritePosition();
    }
  };

  public increaseSpritePosition = () => {
    if (!this.lastMouseEvent) return;

    const intersections = getIntersectionsFromClickPosition(
      this.lastMouseEvent,
      this.spriteHandler.spriteParts,
      this.canvas,
      this.renderer.camera,
      this.isPointerLocked,
    );

    if (intersections.length) {
      const newSelectedVoxel = this.spriteHandler.selectedVoxel;

      const hoveredViewType = intersections[0].object.userData
        .viewType as ViewType;
      switch (hoveredViewType) {
        case ViewType.Transverse:
          newSelectedVoxel.z = Math.min(
            SCAN.voxelCount.z - 1,
            this.spriteHandler.selectedVoxel.z + 1,
          );
          break;
        case ViewType.Sagittal:
          newSelectedVoxel.x = Math.min(
            SCAN.voxelCount.x - 1,
            this.spriteHandler.selectedVoxel.x + 1,
          );
          break;
        case ViewType.Coronal:
          newSelectedVoxel.y = Math.min(
            SCAN.voxelCount.y - 1,
            this.spriteHandler.selectedVoxel.y + 1,
          );
          break;
      }

      this.spriteHandler.setSelectedVoxel(newSelectedVoxel);
      this.transformObject.position.copy(
        this.spriteHandler.spriteGroup.position,
      );
    }
  };

  public decreaseSpritePosition = () => {
    if (!this.lastMouseEvent) return;

    const intersections = getIntersectionsFromClickPosition(
      this.lastMouseEvent,
      this.spriteHandler.spriteParts,
      this.canvas,
      this.renderer.camera,
      this.isPointerLocked,
    );

    if (intersections.length) {
      const newSelectedVoxel = this.spriteHandler.selectedVoxel;

      const hoveredViewType = intersections[0].object.userData
        .viewType as ViewType;
      switch (hoveredViewType) {
        case ViewType.Transverse:
          newSelectedVoxel.z = Math.max(
            0,
            this.spriteHandler.selectedVoxel.z - 1,
          );
          break;
        case ViewType.Sagittal:
          newSelectedVoxel.x = Math.max(
            0,
            this.spriteHandler.selectedVoxel.x - 1,
          );
          break;
        case ViewType.Coronal:
          newSelectedVoxel.y = Math.max(
            0,
            this.spriteHandler.selectedVoxel.y - 1,
          );
          break;
      }

      this.spriteHandler.setSelectedVoxel(newSelectedVoxel);
      this.transformObject.position.copy(
        this.spriteHandler.spriteGroup.position,
      );
    }
  };

  public toggleTransformControls = () => {
    this.transformControls.enabled = !this.transformControls.enabled;
    this.transformControls.visible = !this.transformControls.visible;
  };

  private handleTransformMove = () => {
    this.workingVector.copy(this.transformObject.position);

    this.workingVector.x =
      Math.round(this.workingVector.x / this.voxelDimensions.x) *
      this.voxelDimensions.x;
    this.workingVector.y =
      Math.round(this.workingVector.y / this.voxelDimensions.y) *
      this.voxelDimensions.y;
    this.workingVector.z =
      Math.round(this.workingVector.z / this.voxelDimensions.z) *
      this.voxelDimensions.z;

    this.workingVector.divide(this.voxelDimensions);
    this.workingVector.max(this.minSelectedVoxel);
    this.workingVector.min(this.maxSelectedVoxel);

    // x is inverted...
    this.workingVector.x = SCAN.voxelCount.x - this.workingVector.x - 1;

    this.spriteHandler.setSelectedVoxel(this.workingVector);
  };
}
