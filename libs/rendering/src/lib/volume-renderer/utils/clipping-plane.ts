import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import {
  ClippingPlaneMaterial,
  ClippingPlanePickingMaterial,
} from "./clipping-plane-material";
import { SharedUniforms } from "./shared-uniforms";

export class ClippingPlane extends THREE.Mesh implements IDisposable {
  private plane = new THREE.Plane();
  private workingQuaternion = new THREE.Quaternion();
  private workingVector = new THREE.Vector3();

  private defaultNormal = new THREE.Vector3(0, 0, -1);

  private mainMaterial: ClippingPlaneMaterial;
  private pickingMaterial: ClippingPlanePickingMaterial;

  private disposers: IDisposer[] = [];

  constructor(private editor: IEditor, sharedUniforms: SharedUniforms) {
    super(
      new THREE.PlaneGeometry(),
      new ClippingPlaneMaterial(editor, sharedUniforms),
    );

    this.mainMaterial = this.material as ClippingPlaneMaterial;
    this.pickingMaterial = new ClippingPlanePickingMaterial(
      editor,
      sharedUniforms,
    );

    this.geometry.setAttribute(
      "volumeCoords",
      new THREE.BufferAttribute(new Float32Array(12), 3),
    );

    this.disposers.push(
      reaction(
        () => editor.activeDocument?.viewport3D.clippingPlaneNormal.toArray(),
        this.setNormal,
        { fireImmediately: true },
      ),
      reaction(
        () => editor.activeDocument?.viewport3D.clippingPlaneDistance,
        this.setDistance,
        { fireImmediately: true },
      ),
      autorun(() => {
        this.visible = Boolean(
          editor.activeDocument?.viewport3D.shouldClippingPlaneRender,
        );

        editor.volumeRenderer?.lazyRender();
      }),
      autorun(this.updateDepthWrite),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.mainMaterial.dispose();
    this.pickingMaterial.dispose();
  }

  public onBeforePicking() {
    this.material = this.pickingMaterial;
  }

  public onAfterPicking() {
    this.material = this.mainMaterial;
  }

  private setNormal = (normal?: number[]) => {
    if (!normal) return;
    this.plane.normal.set(normal[0], normal[1], normal[2]).normalize();
    this.workingQuaternion.setFromUnitVectors(
      this.defaultNormal,
      this.plane.normal,
    );
    this.setRotationFromQuaternion(this.workingQuaternion);

    this.updatePosition();
    this.updateDepthWrite();
  };

  private setDistance = (distance?: number) => {
    if (distance === undefined) return;
    this.plane.constant = distance;

    this.updatePosition();
    this.updateDepthWrite();
  };

  private updatePosition() {
    this.position.copy(this.plane.normal).multiplyScalar(-this.plane.constant);

    this.updateVolumeCoords();
  }

  private updateVolumeCoords() {
    this.updateMatrix();

    const positions = this.geometry.attributes
      .position as THREE.BufferAttribute;
    const volumeCoords = this.geometry.attributes
      .volumeCoords as THREE.BufferAttribute;

    for (let i = 0; i < 4; i++) {
      this.workingVector.set(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i),
      );
      this.workingVector.applyMatrix4(this.matrix);
      volumeCoords.setXYZ(
        i,
        this.workingVector.x + 0.5,
        this.workingVector.y + 0.5,
        this.workingVector.z + 0.5,
      );
    }

    volumeCoords.needsUpdate = true;
  }

  private updateDepthWrite = () => {
    const camera =
      this.editor.activeDocument?.viewport3D.volumeSpaceCameraPosition;
    if (!camera) return;
    this.workingVector.fromArray(camera);

    // Only write depth for front face
    const useDepthWrite = this.plane.distanceToPoint(this.workingVector) < 0;
    this.mainMaterial.depthWrite = useDepthWrite;
    this.pickingMaterial.depthWrite = useDepthWrite;
  };
}
