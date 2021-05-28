import {
  IDocument,
  IViewport3D,
  ShadingMode,
  ITransferFunction,
} from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, computed, makeObservable, observable } from "mobx";
import { Matrix4 } from "three";
import {
  ConeTransferFunction,
  DensityTransferFunction,
  EdgesTransferFunction,
  TransferFunction,
  TransferFunctionSnapshot,
} from "./transfer-functions";

export type TransferFunctionName =
  | "density"
  | "fc-edges"
  | "fc-cone"
  | "custom";

export interface Viewport3DSnapshot<N extends string> {
  cameraMatrix: number[];
  opacity: number;
  shadingMode: ShadingMode;

  activeTransferFunctionName?: N;
  transferFunctions: TransferFunctionSnapshot<N>[];
}

// TODO: Handle lighting mode supression when transfer function changes.
export class Viewport3D
  implements
    IViewport3D<TransferFunctionName>,
    ISerializable<Viewport3DSnapshot<TransferFunctionName>> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public isInXR!: boolean;

  public cameraMatrix!: Matrix4;

  public opacity!: number;
  public shadingMode!: ShadingMode;

  protected activeTransferFunctionName?: TransferFunctionName;
  public transferFunctions: Record<
    string,
    TransferFunction<TransferFunctionName>
  >;

  constructor(
    snapshot: Partial<Viewport3DSnapshot<TransferFunctionName>> | undefined,
    protected document: IDocument,
  ) {
    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    makeObservable(this, {
      isInXR: observable,
      cameraMatrix: observable.ref,
      opacity: observable,
      shadingMode: observable,
      transferFunctions: observable,

      activeTransferFunction: computed,

      setCameraMatrix: action,
      setActiveTransferFunction: action,
      setIsInXR: action,
      setOpacity: action,
      setShadingMode: action,
      applySnapshot: action,
    });

    this.transferFunctions = {
      density: new DensityTransferFunction(document),
      "fc-edges": new EdgesTransferFunction(document),
      "fc-cone": new ConeTransferFunction(document),
      // TODO: Handle custom texture upload.
      custom: new TransferFunction<"custom">(
        // TODO: Layer parameter.
        { name: "custom", labelTx: "tf-custom" },
        document,
      ),
    };
  }

  public get activeTransferFunction():
    | ITransferFunction<TransferFunctionName>
    | undefined {
    return this.activeTransferFunctionName
      ? this.transferFunctions[this.activeTransferFunctionName]
      : undefined;
  }

  public setCameraMatrix(value?: Matrix4): void {
    // TODO: Reset to a meaningful camera alignment
    this.cameraMatrix = value || new Matrix4();
  }

  public setActiveTransferFunction(
    nameOrTransferFunction?:
      | TransferFunctionName
      | ITransferFunction<TransferFunctionName>,
  ): void {
    this.activeTransferFunctionName = nameOrTransferFunction
      ? typeof nameOrTransferFunction === "string"
        ? nameOrTransferFunction
        : nameOrTransferFunction.name
      : "fc-edges";
  }

  public setIsInXR(value = false) {
    this.isInXR = value;
  }

  public setOpacity(value = 1) {
    this.opacity = Math.min(1, Math.max(0, value));
  }

  public setShadingMode(value: ShadingMode = "lao") {
    this.shadingMode = value;
  }

  public reset = (): void => {
    this.setCameraMatrix();
    this.setActiveTransferFunction();
    this.setIsInXR();
    this.setOpacity();
    this.setShadingMode();
  };

  // Serialization
  public toJSON(): Viewport3DSnapshot<TransferFunctionName> {
    return {
      cameraMatrix: this.cameraMatrix.toArray(),
      opacity: this.opacity,
      shadingMode: this.shadingMode,
      activeTransferFunctionName: this.activeTransferFunctionName,
      transferFunctions: Object.values(
        this.transferFunctions,
      ).map((transferFunction) => transferFunction.toJSON()),
    };
  }

  public applySnapshot(
    snapshot: Partial<Viewport3DSnapshot<TransferFunctionName>>,
  ): Promise<void> {
    this.setActiveTransferFunction(snapshot?.activeTransferFunctionName);
    this.setCameraMatrix(
      snapshot.cameraMatrix
        ? new Matrix4().fromArray(snapshot.cameraMatrix)
        : undefined,
    );
    this.setIsInXR();
    this.setOpacity(snapshot?.opacity);
    this.setShadingMode(snapshot?.shadingMode);

    return Promise.resolve();
  }
}
