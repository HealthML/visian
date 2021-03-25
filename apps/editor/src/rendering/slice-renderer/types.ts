export interface IDisposable {
  dispose: () => void;
}

export enum ViewType {
  Transverse = 0,
  Sagittal = 1,
  Coronal = 2,
}

export const viewTypes = [
  ViewType.Transverse,
  ViewType.Sagittal,
  ViewType.Coronal,
];
