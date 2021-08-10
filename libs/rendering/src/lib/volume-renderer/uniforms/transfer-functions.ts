import * as THREE from "three";

export const transferFunctionsUniforms = {
  uLimitLow: { value: 0 },
  uLimitHigh: { value: 1 },
  uConeAngle: { value: 1 },
  uConeMatrix: { value: new THREE.Matrix3() },
  uTransferFunction: { value: 0 },
  uUseFocus: { value: false },
  uCustomTFTexture: { value: null },
  uVolumeNearestFiltering: { value: false },
  uUsePlane: { value: false },
  uPlaneNormal: { value: [0, 1, 0] },
  uPlaneDistance: { value: 0 },
  uEdgeColor: { value: [1, 1, 1, 1] },
};
