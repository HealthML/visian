import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

export class CuttingPlane extends THREE.Mesh implements IDisposable {
  private plane = new THREE.Plane();
  private workingQuaternion = new THREE.Quaternion();

  private defaultNormal = new THREE.Vector3(0, 0, -1);

  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super(
      new THREE.PlaneGeometry(),
      new THREE.MeshBasicMaterial({ color: "red" }),
    );

    this.disposers.push(
      reaction(
        () => editor.activeDocument?.viewport3D.cuttingPlaneNormal.toArray(),
        this.setNormal,
      ),
      reaction(
        () => editor.activeDocument?.viewport3D.cuttingPlaneDistance,
        this.setDisatance,
      ),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    (this.material as THREE.Material).dispose();
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
  };

  private setDisatance = (distance?: number) => {
    if (distance === undefined) return;
    this.plane.constant = distance;

    this.updatePosition();
  };

  private updatePosition() {
    this.position.copy(this.plane.normal).multiplyScalar(-this.plane.constant);
  }
}
