import * as THREE from "three";

export interface Texture3DMaterial extends THREE.ShaderMaterial {
  uniforms: { [uniform: string]: THREE.IUniform } & {
    uSlice: THREE.IUniform<number>;
    uDepth: THREE.IUniform<number>;
    uWidth: THREE.IUniform<number>;
    uHeight: THREE.IUniform<number>;
  };
}
