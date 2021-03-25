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
}

export const transferFunctionProps: ITransferFunctionProps[] = [
  {
    updateNormalsOnCameraMove: false,
    updateLAOOnCameraMove: false,
  },
  {
    updateNormalsOnCameraMove: false,
    updateLAOOnCameraMove: false,
  },
  {
    updateNormalsOnCameraMove: true,
    updateLAOOnCameraMove: true,
  },
];

export class TransferFunction implements ITransferFunctionProps {
  public updateNormalsOnCameraMove: boolean;
  public updateLAOOnCameraMove: boolean;

  constructor(public type: TransferFunctionType) {
    const props = transferFunctionProps[type];
    this.updateNormalsOnCameraMove = props.updateNormalsOnCameraMove;
    this.updateLAOOnCameraMove = props.updateLAOOnCameraMove;
  }
}

export const transferFunctions = transferFunctionTypes.map(
  (type) => new TransferFunction(type),
);
