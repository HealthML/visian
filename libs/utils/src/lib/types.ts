export type IDisposer = () => void;

export interface IDisposable {
  dispose: IDisposer;
}

export interface Pixel {
  x: number;
  y: number;
}

export interface Voxel extends Pixel {
  z: number;
}
