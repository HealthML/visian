import * as THREE from "three";

export const commonUniforms = {
  uCameraPosition: { value: new THREE.Vector3() },
  uVolume: { value: null },
  uInputFirstDerivative: { value: null },
  uInputSecondDerivative: { value: null },
  uFocus: { value: null },
  uStepSize: { value: 1 },
};
