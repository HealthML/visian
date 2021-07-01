import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";
import { CuttingPlaneMaterial } from "./cutting-plane-material";

export class CuttingPlane extends THREE.Mesh implements IDisposable {
  private plane = new THREE.Plane();
  private workingQuaternion = new THREE.Quaternion();
  private workingVector = new THREE.Vector3();

  private defaultNormal = new THREE.Vector3(0, 0, -1);

  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super(new THREE.PlaneGeometry(), new CuttingPlaneMaterial(editor));

    this.geometry.setAttribute(
      "volumeCoords",
      new THREE.BufferAttribute(new Float32Array(12), 3),
    );

    this.disposers.push(
      reaction(
        () => editor.activeDocument?.viewport3D.cuttingPlaneNormal.toArray(),
        this.setNormal,
        { fireImmediately: true },
      ),
      reaction(
        () => editor.activeDocument?.viewport3D.cuttingPlaneDistance,
        this.setDistance,
        { fireImmediately: true },
      ),
      autorun(() => {
        this.visible = Boolean(
          editor.activeDocument?.viewport3D.shouldCuttingPlaneRender,
        );

        editor.volumeRenderer?.lazyRender();
      }),
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

  private setDistance = (distance?: number) => {
    if (distance === undefined) return;
    this.plane.constant = distance;

    this.updatePosition();
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
}
