/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform vec3 uCameraPosition;
uniform sampler2D uVolume;
uniform sampler2D uInputFirstDerivative;
uniform sampler2D uInputSecondDerivative;
uniform sampler2D uOutputFirstDerivative;
uniform sampler2D uFocus;
uniform bool uUseFocus;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;
uniform float uStepSize;

// User-defined transfer function options
uniform float uOpacity;
uniform int uTransferFunction;
uniform float uConeAngle;

uniform sampler2D uLAO;

@import ../utils/volume-data;
@import ../gradient/decode-gradient;

#define NORMAL
#define LAO
@import ../utils/get-interpolated-volume-data;

@import ../utils/phong;
@import ../utils/compute-near-far;
@import ./transfer-functions;

vec4 getVolumeColor(vec3 volumeCoords) {
  VolumeData volumeData = getInterpolatedVolumeData(volumeCoords);
  vec4 volumeColor = transferFunction(volumeData, volumeCoords);
  // return vec4(volumeColor.rgb, volumeColor.a * uOpacity);
  // vec4 phongColor = phong(volumeColor, volumeData, volumeCoords);
  // return vec4(phongColor.rgb, phongColor.a * uOpacity);

  return vec4(volumeColor.rgb * volumeData.lao, volumeColor.a * uOpacity);
}

@import ../utils/march-ray;

/**
 * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
 */
void main() {
  vec3 normalizedRayDirection = normalize(vRayDirection);

  float near;
  float far;
  computeNearFar(normalizedRayDirection, near, far);

  gl_FragColor = marchRay(vRayOrigin, normalizedRayDirection, near, far, uStepSize);
}
