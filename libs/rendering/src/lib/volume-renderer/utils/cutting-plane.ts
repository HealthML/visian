import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";

export class CuttingPlane extends THREE.Mesh implements IDisposable {
  private workingPlane = new THREE.Plane();
  private workingVector = new THREE.Vector3();
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
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    (this.material as THREE.Material).dispose();
  }

  private setNormal = (normal?: number[]) => {
    if (!normal) return;
    this.workingVector.set(normal[0], normal[1], normal[2]).normalize();
    this.workingQuaternion.setFromUnitVectors(
      this.defaultNormal,
      this.workingVector,
    );
    this.setRotationFromQuaternion(this.workingQuaternion);
  };
}
