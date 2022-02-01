import {
  IDocument,
  IViewport3D,
  ShadingMode,
  ITransferFunction,
} from "@visian/ui-shared";
import { ISerializable, Vector, ViewType } from "@visian/utils";
import FileSaver from "file-saver";
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
  orbitTarget: number[];

  opacity: number;
  shadingMode: ShadingMode;

  activeTransferFunctionName?: N;
  transferFunctions: TransferFunctionSnapshot<N>[];

  useSmoothSegmentations: boolean;

  useClippingPlane: boolean;
  clippingPlaneNormal: number[];
  clippingPlaneDistance: number;
  shouldClippingPlaneRender: boolean;
  shouldClippingPlaneShowAnnotations: boolean;
}

export class Viewport3D
  implements
    IViewport3D<TransferFunctionName>,
    ISerializable<Viewport3DSnapshot<TransferFunctionName>> {
  public readonly excludeFromSnapshotTracking = ["document", "isXRAvailable"];

  public isXRAvailable?: boolean;
  public isInXR!: boolean;

  public cameraMatrix!: Matrix4;
  public orbitTarget = new Vector(3);
  public volumeSpaceCameraPosition: [number, number, number] = [0, 0, 0];

  public opacity!: number;
  public shadingMode!: ShadingMode;
  public requestedShadingMode?: ShadingMode;

  protected activeTransferFunctionName?: TransferFunctionName;
  public transferFunctions: Record<
    string,
    TransferFunction<TransferFunctionName>
  >;

  public useSmoothSegmentations = false;

  public useClippingPlane = false;
  public clippingPlaneNormal = new Vector([0, 1, 0]);
  public clippingPlaneDistance = 0;
  public shouldClippingPlaneRender = false;
  public shouldClippingPlaneShowAnnotations = true;

  constructor(
    snapshot: Partial<Viewport3DSnapshot<TransferFunctionName>> | undefined,
    protected document: IDocument,
  ) {
    makeObservable<
      this,
      | "activeTransferFunctionName"
      | "setRequestedShadingMode"
      | "setIsXRAvailable"
      | "setShadingMode"
    >(this, {
      isXRAvailable: observable,
      isInXR: observable,
      cameraMatrix: observable.ref,
      orbitTarget: observable,
      volumeSpaceCameraPosition: observable,
      opacity: observable,
      shadingMode: observable,
      requestedShadingMode: observable,
      activeTransferFunctionName: observable,
      transferFunctions: observable,
      useSmoothSegmentations: observable,
      useClippingPlane: observable,
      clippingPlaneNormal: observable,
      clippingPlaneDistance: observable,
      shouldClippingPlaneRender: observable,
      shouldClippingPlaneShowAnnotations: observable,

      activeTransferFunction: computed,

      setCameraMatrix: action,
      setOrbitTarget: action,
      setVolumeSpaceCameraPosition: action,
      setActiveTransferFunction: action,
      setOpacity: action,
      requestShadingMode: action,
      setShadingMode: action,
      setRequestedShadingMode: action,
      onTransferFunctionChange: action,
      setIsXRAvailable: action,
      setIsInXR: action,
      setUseSmoothSegmentations: action,
      setUseClippingPlane: action,
      setClippingPlaneNormal: action,
      setClippingPlaneNormalToFaceCamera: action,
      setClippingPlaneDistance: action,
      increaseClippingPlaneDistance: action,
      decreaseClippingPlaneDistance: action,
      setShouldClippingPlaneRender: action,
      setShouldClippingPlaneShowAnnotations: action,
      resetClippingPlane: action,
      reset: action,
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

    this.checkIsXRAvailable();
  }

  public get activeTransferFunction():
    | ITransferFunction<TransferFunctionName>
    | undefined {
    return this.activeTransferFunctionName
      ? this.transferFunctions[this.activeTransferFunctionName]
      : undefined;
  }

  public setCameraMatrix(value?: Matrix4): void {
    this.cameraMatrix =
      value ||
      new Matrix4().fromArray([
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

  public setOrbitTarget(x = 0, y = 1.2, z = 0) {
    this.orbitTarget.set(x, y, z);
  }

  public setVolumeSpaceCameraPosition(x: number, y: number, z: number) {
    this.volumeSpaceCameraPosition = [x, y, z];

    if (!this.transferFunctions["fc-cone"].params.isConeLocked.value) {
      (this.transferFunctions[
        "fc-cone"
      ] as ConeTransferFunction).setConeDirection(x, y, z);
    }

    if (this.document.tools.activeTool?.name === "plane-tool") {
      this.setClippingPlaneNormalToFaceCamera();
    }
  }

  public setCameraToFaceViewType(viewType: ViewType, flipped = false) {
    const cameraPosition = new Vector(3, false);
    cameraPosition.setFromView(viewType, 1.2 * (flipped ? -1 : 1));

    this.setOrbitTarget();

    this.document.volumeRenderer?.setVolumeSpaceCameraPosition(cameraPosition);
  }

  public setClippingPlaneNormalToFaceCamera() {
    const [x, y, z] = this.volumeSpaceCameraPosition;
    this.setClippingPlaneNormal(-x, -y, -z);
  }

  public setActiveTransferFunction = (
    nameOrTransferFunction?:
      | TransferFunctionName
      | ITransferFunction<TransferFunctionName>,
    isSilent?: boolean,
  ): void => {
    if (!isSilent) this.onTransferFunctionChange();

    this.activeTransferFunctionName = nameOrTransferFunction
      ? typeof nameOrTransferFunction === "string"
        ? nameOrTransferFunction
        : nameOrTransferFunction.name
      : "fc-edges";

    this.activeTransferFunction?.activate();
  };

  public cycleActiveTransferFunction(): void {
    const transferFunctionNames = Object.keys(
      this.transferFunctions,
    ) as TransferFunctionName[];
    this.setActiveTransferFunction(
      transferFunctionNames[
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (transferFunctionNames.indexOf(this.activeTransferFunctionName!) + 1) %
          transferFunctionNames.length
      ],
    );
  }

  public setUseSmoothSegmentations = (value = false) => {
    this.useSmoothSegmentations = value;
  };

  public setOpacity(value = 1) {
    this.onTransferFunctionChange();

    this.opacity = Math.min(1, Math.max(0, value));
  }

  public requestShadingMode = (mode: ShadingMode = "lao") => {
    this.setShadingMode("none");
    this.setRequestedShadingMode(mode === "none" ? undefined : mode);
  };

  protected setShadingMode(value: ShadingMode = "lao") {
    this.shadingMode = value;
  }

  public cycleShadingMode(): void {
    switch (this.shadingMode) {
      case "none":
        this.requestShadingMode("phong");
        break;
      case "phong":
        this.requestShadingMode("lao");
        break;
      case "lao":
        this.requestShadingMode("none");
    }
  }

  public confirmRequestedShadingMode() {
    if (this.requestedShadingMode) {
      this.setShadingMode(this.requestedShadingMode);
      this.setRequestedShadingMode();
    }
  }

  protected setRequestedShadingMode(value?: ShadingMode) {
    this.requestedShadingMode = value;
  }

  public onTransferFunctionChange = () => {
    if (this.shadingMode === "none") return;

    this.requestShadingMode(this.shadingMode);
  };

  // XR
  protected setIsXRAvailable(value = false) {
    this.isXRAvailable = value;
  }
  public async checkIsXRAvailable() {
    const isXRAvailable =
      "xr" in navigator &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (await (navigator as THREE.Navigator).xr!.isSessionSupported(
        "immersive-vr",
      ));

    this.setIsXRAvailable(isXRAvailable);
    return isXRAvailable;
  }
  public setIsInXR(value = false) {
    this.isInXR = value;
  }

  public enterXR = () => {
    this.document.viewSettings.setViewMode("3D");
    this.document.volumeRenderer?.xr.enterXR();
  };
  public exitXR = () => {
    this.document.volumeRenderer?.xr.exitXR();
  };

  // Clipping Plane
  public setUseClippingPlane = (value = false) => {
    if (value !== this.useClippingPlane) {
      this.useClippingPlane = value;
      this.onTransferFunctionChange();
    }

    if (!value) this.setShouldClippingPlaneRender();
  };

  public setClippingPlaneNormal(x = 0, y = 1, z = 0) {
    this.clippingPlaneNormal.set(x, y, z);
    this.clippingPlaneNormal.normalize();
    this.onTransferFunctionChange();
  }

  public setClippingPlaneDistance(value = 0) {
    this.clippingPlaneDistance = value;
    this.onTransferFunctionChange();
  }
  public increaseClippingPlaneDistance() {
    this.setClippingPlaneDistance(this.clippingPlaneDistance + 0.02);
  }
  public decreaseClippingPlaneDistance() {
    this.setClippingPlaneDistance(this.clippingPlaneDistance - 0.02);
  }

  public setShouldClippingPlaneRender = (value = false) => {
    this.shouldClippingPlaneRender = value;
    if (value) this.setUseClippingPlane(true);
  };

  public setShouldClippingPlaneShowAnnotations = (value = true) => {
    this.shouldClippingPlaneShowAnnotations = value;
  };

  public resetClippingPlane = () => {
    this.setUseClippingPlane();
    this.setClippingPlaneNormal();
    this.setClippingPlaneDistance();
    this.setShouldClippingPlaneRender();
    this.setShouldClippingPlaneShowAnnotations();
  };

  public exportCanvasImage = () => {
    if (!this.document.volumeRenderer) return;

    const canvas = this.document.volumeRenderer.renderer.domElement;

    const saveCallback = (blob: Blob | null) => {
      if (!blob) return;
      const name = `${
        this.document.title?.split(".")[0] || "visian_export"
      }.png`;
      FileSaver.saveAs(blob, name);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((canvas as any).msToBlob) {
      // Edge
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvas as any).msToBlob(saveCallback);
    } else {
      // Other browsers
      canvas.toBlob(saveCallback);
    }
  };

  public reset = (): void => {
    this.setIsInXR();
    this.setCameraMatrix();
    this.setOrbitTarget();
    this.setOpacity();
    this.setActiveTransferFunction(undefined, true);
    this.requestShadingMode();
    Object.values(this.transferFunctions).forEach((transferFunction) => {
      transferFunction.reset();
    });
    this.setUseSmoothSegmentations();
    this.resetClippingPlane();
  };

  // Serialization
  public toJSON(): Viewport3DSnapshot<TransferFunctionName> {
    return {
      cameraMatrix: this.cameraMatrix.toArray(),
      orbitTarget: this.orbitTarget.toJSON(),
      opacity: this.opacity,
      shadingMode: this.requestedShadingMode || this.shadingMode,
      activeTransferFunctionName: this.activeTransferFunctionName,
      transferFunctions: Object.values(
        this.transferFunctions,
      ).map((transferFunction) => transferFunction.toJSON()),
      useSmoothSegmentations: this.useSmoothSegmentations,
      useClippingPlane: this.useClippingPlane,
      clippingPlaneNormal: this.clippingPlaneNormal.toJSON(),
      clippingPlaneDistance: this.clippingPlaneDistance,
      shouldClippingPlaneRender: this.shouldClippingPlaneRender,
      shouldClippingPlaneShowAnnotations: this
        .shouldClippingPlaneShowAnnotations,
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
    const orbitTarget = snapshot?.orbitTarget;
    if (orbitTarget) {
      this.setOrbitTarget(...orbitTarget);
    } else {
      this.setOrbitTarget();
    }
    this.setOpacity(snapshot?.opacity);
    this.requestShadingMode(snapshot?.shadingMode);
    this.setActiveTransferFunction(snapshot?.activeTransferFunctionName, true);
    snapshot?.transferFunctions?.forEach((transferFunctionSnapshot) => {
      const transferFunction = this.transferFunctions[
        transferFunctionSnapshot.name
      ];
      if (transferFunction) {
        transferFunction.applySnapshot(transferFunctionSnapshot);
      }
    });
    this.setUseSmoothSegmentations(snapshot?.useSmoothSegmentations);
    this.setUseClippingPlane(snapshot?.useClippingPlane);
    const clippingPlaneNormal = snapshot?.clippingPlaneNormal;
    if (clippingPlaneNormal) {
      this.setClippingPlaneNormal(
        clippingPlaneNormal[0],
        clippingPlaneNormal[1],
        clippingPlaneNormal[2],
      );
    } else {
      this.setClippingPlaneNormal();
    }
    this.setClippingPlaneDistance(snapshot?.clippingPlaneDistance);
    this.setShouldClippingPlaneRender(snapshot?.shouldClippingPlaneRender);
    this.setShouldClippingPlaneShowAnnotations(
      snapshot?.shouldClippingPlaneShowAnnotations,
    );

    return Promise.resolve();
  }
}
