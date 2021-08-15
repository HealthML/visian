import { IEditor, IConeTransferFunction } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

const coneHeight = new THREE.Vector3().setScalar(0.5).length();

const getConeRadius = (angle: number) => {
  const tan = Math.tan(angle);
  return coneHeight * tan;
};

const getConeGeometry = (editor: IEditor) =>
  new THREE.ConeBufferGeometry(
    getConeRadius(
      (editor.activeDocument?.viewport3D.transferFunctions["fc-cone"].params
        .coneAngle?.value ?? 1) as number,
    ),
    coneHeight,
    100,
    1,
    true,
  ).translate(0, coneHeight / -2, 0);

/**
 * This cone is used to raycast against the surface area of the clipping cone of
 * the cone transfer function. It is invisible by default, as it should not be
 * rendered usually.
 * For raycasting `visible` should be set to `true`.
 * Additionally `updateGeometry` must be called to make sure the cone angle
 * matches the transfer function.
 */
export class RaycastingCone extends THREE.Mesh implements IDisposable {
  private disposers: IDisposer[] = [];

  private isGeometryDirty = false;

  private defaultNormal = new THREE.Vector3(0, -1, 0);
  private workingVector = new THREE.Vector3();
  private workingQuaternion = new THREE.Quaternion();

  constructor(private editor: IEditor) {
    super(
      getConeGeometry(editor),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    );

    this.visible = false;

    this.disposers.push(
      reaction(
        () =>
          editor.activeDocument?.viewport3D.transferFunctions["fc-cone"].params
            .coneAngle?.value,
        () => {
          this.isGeometryDirty = true;
        },
      ),
      autorun(() => {
        this.workingVector
          .fromArray(
            (editor.activeDocument?.viewport3D.transferFunctions["fc-cone"] as
              | IConeTransferFunction
              | undefined)?.coneDirection.toArray() ?? [0, 0, -1],
          )
          .normalize();
        this.workingQuaternion.setFromUnitVectors(
          this.defaultNormal,
          this.workingVector,
        );
        this.setRotationFromQuaternion(this.workingQuaternion);
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }

  public updateGeometry() {
    if (!this.isGeometryDirty) return;

    this.geometry.dispose();
    this.geometry = getConeGeometry(this.editor);

    this.isGeometryDirty = false;
  }
}
