import * as THREE from "three";

export const textureFormatForComponents = (components: number) =>
  components === 1
    ? THREE.RedFormat
    : components === 2
    ? THREE.RGFormat
    : components === 3
    ? THREE.RGBFormat
    : THREE.RGBAFormat;
