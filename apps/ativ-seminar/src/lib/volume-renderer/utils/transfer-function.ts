export enum TransferFunctionType {
  Density = 0,
  FCEdges = 1,
  FCCutaway = 2,
}

export const transferFunctionTypes = [
  TransferFunctionType.Density,
  TransferFunctionType.FCEdges,
  TransferFunctionType.FCCutaway,
];

// TODO: Add properties for which sliders to display etc.
export interface ITransferFunctionProps {
  updateNormalsOnCameraMove: boolean;
  updateLAOOnCameraMove: boolean;
  defaultLAOIntensity: number;
}

export const transferFunctionProps: ITransferFunctionProps[] = [
  {
    updateNormalsOnCameraMove: false,
    updateLAOOnCameraMove: false,
    defaultLAOIntensity: 2.5,
  },
  {
    updateNormalsOnCameraMove: false,
    updateLAOOnCameraMove: false,
    defaultLAOIntensity: 1,
  },
  {
    updateNormalsOnCameraMove: true,
    updateLAOOnCameraMove: true,
    defaultLAOIntensity: 2.5,
  },
];

export class TransferFunction implements ITransferFunctionProps {
  public readonly updateNormalsOnCameraMove: boolean;
  public readonly updateLAOOnCameraMove: boolean;
  public readonly defaultLAOIntensity: number;

  constructor(public readonly type: TransferFunctionType) {
    const props = transferFunctionProps[type];
    this.updateNormalsOnCameraMove = props.updateNormalsOnCameraMove;
    this.updateLAOOnCameraMove = props.updateLAOOnCameraMove;
    this.defaultLAOIntensity = props.defaultLAOIntensity;
  }
}

export const transferFunctions = transferFunctionTypes.map(
  (type) => new TransferFunction(type),
);
