export interface IVolumeRenderer {
  animate: () => void;

  lazyRender(updateLighting?: boolean): void;
}
