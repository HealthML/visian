import * as THREE from "three";

export const getTextureFormat = (components: number) =>
  components === 1
    ? THREE.RedFormat
    : components === 2
    ? THREE.RGFormat
    : components === 3
    ? THREE.RGBFormat
    : THREE.RGBAFormat;

// R32F, etc. cannot be lineraly filtered without an extension.
// TODO: Check if the extension is available and use R32F, etc. if it makes sense.
export const getInternalTextureFormat = (
  components: number,
  bytesPerElement: number,
) =>
  bytesPerElement === 1
    ? null
    : components === 1
    ? "R16F"
    : components === 2
    ? "RG16F"
    : components === 3
    ? "RGB16F"
    : "RGBA16F";
