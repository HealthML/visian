import * as THREE from "three";

export const transferFunctionsUniforms = {
  uFocusColor: { value: new THREE.Color() },
  uFocusOpacity: { value: 1 },
  uContextColor: { value: new THREE.Color() },
  uContextOpacity: { value: 1 },
  uLimitLow: { value: 0 },
  uLimitHigh: { value: 1 },
  uConeAngle: { value: 1 },
  uConeDirection: { value: [1, 0, 0] },
  uTransferFunction: { value: 0 },
  uUseFocus: { value: false },
  uCustomTFTexture: { value: null },
};
