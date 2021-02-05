export interface SpriteUniforms {
  activeSlices: {
    value: [number, number, number];
  };
  scanSize: {
    value: [number, number, number];
  };
  sliceCountU: {
    value: number;
  };
  sliceCountV: {
    value: number;
  };
  scanBackground: {
    value: number;
  };
  dataTexture: {
    type: "t";
    value: THREE.Texture;
  };
  contrast: {
    value: number;
  };
  brightness: {
    value: number;
  };
  blueTint: {
    value: boolean;
  };
  opacity: {
    value: number;
  };
}
