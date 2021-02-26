import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import { CameraNavigator, SpriteHandler } from ".";
import { Renderer } from "..";
import * as SCAN from "../../staticScan";
import { IDisposable, ViewType } from "../../types";
import { getIntersectionsFromClickPosition } from "../../utils";

export default class ScanNavigator implements IDisposable {
  private camera: THREE.PerspectiveCamera;

  private transformControls: TransformControls;
  private transformObject: THREE.Object3D;

  private lastMouseEvent?: MouseEvent;

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
    private cameraNavigator: CameraNavigator,
  ) {
    this.camera = renderer.camera;

    this.transformObject = new THREE.Object3D();
    this.transformObject.position.copy(this.spriteHandler.spriteGroup.position);
    this.renderer.scanOffsetGroup.add(this.transformObject);

    this.transformControls = new TransformControls(this.camera, canvas);
    this.transformControls.attach(this.transformObject);
    this.transformControls.setSpace("local");

    renderer.scene.add(this.transformControls);

    document.addEventListener("mousemove", this.saveMouseEvent);

    this.transformControls.addEventListener(
      "mouseDown",
      this.cameraNavigator.disableOrbitControls,
    );
    this.transformControls.addEventListener(
      "mouseUp",
      this.cameraNavigator.enableOrbitControls,
    );
    this.transformControls.addEventListener(
      "objectChange",
      this.handleTransformMove,
    );

    this.canvas.addEventListener("wheel", this.handleWheel);

    this.toggleTransformControls();
  }

  public dispose = () => {
    document.removeEventListener("mousemove", this.saveMouseEvent);

    this.transformControls.removeEventListener(
      "mouseDown",
      this.cameraNavigator.disableOrbitControls,
    );
    this.transformControls.removeEventListener(
      "mouseUp",
      this.cameraNavigator.enableOrbitControls,
    );
    this.transformControls.removeEventListener(
      "objectChange",
      this.handleTransformMove,
    );
    this.transformControls.dispose();

    this.canvas.removeEventListener("wheel", this.handleWheel);
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (event.deltaY > 0) {
      this.increaseSpritePosition();
    } else if (event.deltaY < 0) {
      this.decreaseSpritePosition();
    }
  };

  private saveMouseEvent = (event: MouseEvent) => {
    this.lastMouseEvent = event;
  };

  public increaseSpritePosition = () => {
    if (!this.lastMouseEvent) return;

    const intersections = getIntersectionsFromClickPosition(
      this.lastMouseEvent,
      this.spriteHandler.spriteParts,
      this.canvas,
      this.renderer.camera,
      this.cameraNavigator.isPointerLocked,
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
      this.cameraNavigator.isPointerLocked,
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
