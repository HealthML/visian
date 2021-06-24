export interface IVolumeRenderer {
  animate: () => void;

  lazyRender(updateLighting?: boolean): void;

  enterXR(): Promise<void>;
  exitXR(): Promise<void>;
}
