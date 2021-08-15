#include <packing>

/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform sampler2D uOutputFirstDerivative;
uniform sampler2D uLAO;
uniform sampler2D uDepthPass;
uniform vec2 uDepthSize;
uniform float uCameraNear;
uniform float uCameraFar;

uniform bool uUseRayDithering;

@import ../uniforms/u-opacity;
@import ../uniforms/u-common;
@import ../uniforms/u-atlas-info;
@import ../uniforms/u-image-info;
@import ../uniforms/u-transfer-functions;
@import ../uniforms/u-lighting;

@import ../utils/volume-data;
@import ../utils/decode-vec3;

#define NORMAL
#define LAO
@import ../utils/get-interpolated-volume-data;

@import ../utils/phong;
@import ../utils/compute-near-far;
@import ./transfer-functions;

vec4 getVolumeColor(vec3 volumeCoords) {
  VolumeData volumeData = getInterpolatedVolumeData(volumeCoords);
  vec4 volumeColor = transferFunction(volumeData, volumeCoords);

  if(uLightingMode == 1) {
    volumeColor = phong(volumeColor, volumeData, volumeCoords);
  } else if(uLightingMode == 2) {
    volumeColor = vec4(volumeColor.rgb * volumeData.lao, volumeColor.a);
  }

  volumeColor = vec4(
    uBrightness * pow(volumeColor.rgb, vec3(uContrast)), 
    volumeColor.a
  );

  return vec4(volumeColor.rgb, volumeColor.a * uOpacity);
}

#define RAY_DITHERING
@import ../utils/march-ray;

/**
 * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
 */
void main() {
  vec3 normalizedRayDirection = normalize(vRayDirection);

  float near;
  float far;
  computeNearFar(normalizedRayDirection, near, far);

  #ifdef VOLUMETRIC_OCCLUSION
    float depth = texture2D(uDepthPass, gl_FragCoord.xy / uDepthSize).x;
    float viewZ = perspectiveDepthToViewZ(depth, uCameraNear, uCameraFar);
  #else
    float viewZ = 1.0;
  #endif
  gl_FragColor = marchRay(vRayOrigin, normalizedRayDirection, near, far, uStepSize, uUseRayDithering, viewZ);
}
