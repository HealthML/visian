import { IConeTransferFunction, IDocument } from "@visian/ui-shared";
import { ISerializable, Vector } from "@visian/utils";
import { action, makeObservable, observable } from "mobx";

import { BooleanParameter, NumberParameter, Parameter } from "../../parameters";
import {
  TransferFunction,
  TransferFunctionSnapshot,
} from "./transfer-function";

export interface ConeTransferFunctionSnapshot
  extends TransferFunctionSnapshot<"fc-cone"> {
  coneDirection: number[];
}

export class ConeTransferFunction
  extends TransferFunction<"fc-cone">
  implements IConeTransferFunction, ISerializable<ConeTransferFunctionSnapshot>
{
  public coneDirection = new Vector([1, 0, 0]);

  constructor(document: IDocument) {
    super(
      {
        name: "fc-cone",
        labelTx: "tf-fc-cone",
      },
      document,
    );

    this.initializeParams([
      new BooleanParameter({
        name: "isConeLocked",
        labelTx: "lock-cone",
        defaultValue: false,
        onBeforeValueChange: () => {
          if (this.params.isConeLocked.value) {
            document.viewport3D?.onTransferFunctionChange();
          }
        },
      }) as Parameter<unknown>,
      new NumberParameter({
        name: "coneAngle",
        labelTx: "cone-angle",
        defaultValue: 1,
        min: 0,
        max: Math.PI,
        onBeforeValueChange: () =>
          document.viewport3D?.onTransferFunctionChange(),
      }) as Parameter<unknown>,
    ]);

    makeObservable<this>(this, {
      coneDirection: observable,
      setConeDirection: action,
    });
  }

  public setConeDirection(x: number, y: number, z: number) {
    if (this.document.viewport3D.activeTransferFunction?.name === this.name) {
      this.document.viewport3D.onTransferFunctionChange();
    }

    this.coneDirection.set(x, y, z);
    this.coneDirection.normalize();
  }

  // Serialization
  public toJSON(): ConeTransferFunctionSnapshot {
    return {
      ...super.toJSON(),
      coneDirection: this.coneDirection.toArray(),
    };
  }

  public applySnapshot(
    snapshot: Partial<ConeTransferFunctionSnapshot>,
  ): Promise<void> {
    super.applySnapshot(snapshot);

    if (snapshot.coneDirection)
      this.coneDirection.fromArray(snapshot.coneDirection);

    return Promise.resolve();
  }
}
