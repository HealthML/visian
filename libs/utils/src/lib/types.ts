export type IDisposer = () => void;

export interface IDisposable {
  dispose: IDisposer;
}
