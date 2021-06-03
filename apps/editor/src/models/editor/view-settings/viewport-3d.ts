import {
  IDocument,
  IViewport3D,
  ShadingMode,
  ITransferFunction,
} from "@visian/ui-shared";
import { ISerializable } from "@visian/utils";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { Matrix4 } from "three";
import {
  ConeTransferFunction,
  CustomTransferFunction,
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

export class Viewport3D
  implements
    IViewport3D<TransferFunctionName>,
    ISerializable<Viewport3DSnapshot<TransferFunctionName>> {
  public readonly excludeFromSnapshotTracking = ["document"];

  public isInXR!: boolean;

  public cameraMatrix!: Matrix4;
  public volumeSpaceCameraPosition: [number, number, number] = [0, 0, 0];

  public opacity!: number;
  public shadingMode!: ShadingMode;
  public suppressesShadingMode?: ShadingMode;

  protected activeTransferFunctionName?: TransferFunctionName;
  public transferFunctions: Record<
    string,
    TransferFunction<TransferFunctionName>
  >;

  private shadingTimeout?: NodeJS.Timer;

  constructor(
    snapshot: Partial<Viewport3DSnapshot<TransferFunctionName>> | undefined,
    protected document: IDocument,
  ) {
    makeObservable<
      this,
      "activeTransferFunctionName" | "setSuppressedShadingMode"
    >(this, {
      isInXR: observable,
      cameraMatrix: observable.ref,
      volumeSpaceCameraPosition: observable,
      opacity: observable,
      shadingMode: observable,
      suppressesShadingMode: observable,
      activeTransferFunctionName: observable,
      transferFunctions: observable,

      activeTransferFunction: computed,

      setCameraMatrix: action,
      setVolumeSpaceCameraPosition: action,
      setActiveTransferFunction: action,
      setIsInXR: action,
      setOpacity: action,
      setShadingMode: action,
      setSuppressedShadingMode: action,
      onTransferFunctionChange: action,
      applySnapshot: action,
    });

    this.transferFunctions = {
      density: new DensityTransferFunction(document),
      "fc-edges": new EdgesTransferFunction(document),
      "fc-cone": new ConeTransferFunction(document),
      custom: new CustomTransferFunction(document),
    };

    if (snapshot) {
      this.applySnapshot(snapshot);
    } else {
      this.reset();
    }

    autorun(() => {
      if (this.document.viewSettings.viewMode === "3D") {
        this.activeTransferFunction?.activate();
      }
    });
  }

  public get activeTransferFunction():
    | ITransferFunction<TransferFunctionName>
    | undefined {
    return this.activeTransferFunctionName
      ? this.transferFunctions[this.activeTransferFunctionName]
      : undefined;
  }

  public setCameraMatrix(value?: Matrix4): void {
    if (value) {
      this.cameraMatrix = value;
      return;
    }

    this.cameraMatrix = new Matrix4().fromArray([
      -0.7071067811865475,
      0,
      -0.7071067811865475,
      0,
      -0.408248290463863,
      0.816496580927726,
      0.408248290463863,
      0,
      0.5773502691896257,
      0.5773502691896257,
      -0.5773502691896255,
      0,
      0.3,
      1.5,
      -0.3,
      1,
    ]);
  }

  public setVolumeSpaceCameraPosition(x: number, y: number, z: number) {
    this.volumeSpaceCameraPosition = [x, y, z];

    if (!this.transferFunctions["fc-cone"].params.isConeLocked.value) {
      (this.transferFunctions[
        "fc-cone"
      ] as ConeTransferFunction).setConeDirection(x, y, z);
    }
  }

  public setActiveTransferFunction = (
    nameOrTransferFunction?:
      | TransferFunctionName
      | ITransferFunction<TransferFunctionName>,
  ): void => {
    this.onTransferFunctionChange();

    this.activeTransferFunctionName = nameOrTransferFunction
      ? typeof nameOrTransferFunction === "string"
        ? nameOrTransferFunction
        : nameOrTransferFunction.name
      : "fc-edges";

    this.activeTransferFunction?.activate();
  };

  public setIsInXR(value = false) {
    this.isInXR = value;
  }

  public setOpacity(value = 1) {
    this.onTransferFunctionChange();

    this.opacity = Math.min(1, Math.max(0, value));
  }

  public setShadingMode(value: ShadingMode = "lao") {
    this.shadingMode = value;
  }

  protected setSuppressedShadingMode(value?: ShadingMode) {
    this.suppressesShadingMode = value;
  }

  public onTransferFunctionChange = () => {
    if (this.shadingMode === "none" && !this.suppressesShadingMode) return;

    if (!this.suppressesShadingMode) {
      this.setSuppressedShadingMode(this.shadingMode);
      this.setShadingMode("none");
    }

    if (this.shadingTimeout !== undefined) {
      clearTimeout(this.shadingTimeout);
    }
    this.shadingTimeout = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.setShadingMode(this.suppressesShadingMode!);
      this.setSuppressedShadingMode();
      this.shadingTimeout = undefined;
    }, 200);
  };

  public reset = (): void => {
    this.setIsInXR();
    this.setCameraMatrix();
    this.setOpacity();
    this.setShadingMode();
    Object.values(this.transferFunctions).forEach((transferFunction) => {
      transferFunction.reset();
    });
    this.setActiveTransferFunction();
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
    this.setIsInXR();
    this.setCameraMatrix(
      snapshot.cameraMatrix
        ? new Matrix4().fromArray(snapshot.cameraMatrix)
        : undefined,
    );
    this.setOpacity(snapshot?.opacity);
    this.setShadingMode(snapshot?.shadingMode);
    this.setActiveTransferFunction(snapshot?.activeTransferFunctionName);
    snapshot?.transferFunctions?.forEach((transferFunctionSnapshot) => {
      const transferFunction = this.transferFunctions[
        transferFunctionSnapshot.name
      ];
      if (transferFunction) {
        transferFunction.applySnapshot(transferFunctionSnapshot);
      }
    });

    return Promise.resolve();
  }
}
