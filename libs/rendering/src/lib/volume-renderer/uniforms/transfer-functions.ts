import * as THREE from "three";

export const transferFunctionsUniforms = {
  uFocusColor: { value: new THREE.Color() },
  uFocusOpacity: { value: 1 },
  uContextColor: { value: new THREE.Color() },
  uContextOpacity: { value: 1 },
  uLimitLow: { value: 0 },
  uLimitHigh: { value: 1 },
  uConeAngle: { value: 1 },
  uConeMatrix: { value: new THREE.Matrix3() },
  uTransferFunction: { value: 0 },
  uUseFocus: { value: false },
  uCustomTFTexture: { value: null },
  uVolumeNearestFiltering: { value: false },
};
