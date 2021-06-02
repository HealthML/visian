export interface IVolumeRenderer {
  animate: () => void;

  lazyRender(): void;
}
