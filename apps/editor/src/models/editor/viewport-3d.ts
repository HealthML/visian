import { IDocument, IViewport3D } from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";
import { Matrix4 } from "three";

export interface Viewport3DSnapshot {
  cameraMatrix: number[];
}

export class Viewport3D
  implements IViewport3D, ISerializable<Viewport3DSnapshot> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public cameraMatrix!: Matrix4;

  constructor(
    snapshot: Partial<Viewport3DSnapshot> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    makeObservable(this, {
      cameraMatrix: observable.ref,

      setCameraMatrix: action,
      applySnapshot: action,
    });
  }

  public setCameraMatrix(value?: Matrix4): void {
    // TODO: Reset to a meaningful camera alignment
    this.cameraMatrix = value || new Matrix4();
  }

  public reset = (): void => {
    this.setCameraMatrix();
  };

  // Serialization
  public toJSON(): Viewport3DSnapshot {
    return {
      cameraMatrix: this.cameraMatrix.toArray(),
    };
  }

  public applySnapshot(snapshot: Partial<Viewport3DSnapshot>): Promise<void> {
    this.setCameraMatrix(
      snapshot.cameraMatrix
        ? new Matrix4().fromArray(snapshot.cameraMatrix)
        : undefined,
    );

    return Promise.resolve();
  }
}
