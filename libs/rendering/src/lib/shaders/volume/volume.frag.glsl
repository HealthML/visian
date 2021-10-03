/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform sampler2D uOutputFirstDerivative;
uniform sampler2D uLAO;

uniform bool uUseRayDithering;

uniform bool uShowSeedPreview;
uniform vec3 uSeedPreview;

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

  if(uShowSeedPreview && length(volumeCoords - uSeedPreview / uVoxelCount ) < 0.004) {
    volumeColor = vec4(uLayerColors[0], 1.0);
  }

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

#ifndef VOXEL_PICKING
  #define RAY_DITHERING
#endif
@import ../utils/march-ray;

/**
 * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
 */
void main() {
  vec3 normalizedRayDirection = normalize(vRayDirection);

  float near;
  float far;
  computeNearFar(normalizedRayDirection, near, far);

  #ifndef VOXEL_PICKING
    gl_FragColor = marchRay(vRayOrigin, normalizedRayDirection, near, far, uStepSize, uUseRayDithering);
  #else
    vec4 pickedVoxel = marchRay(vRayOrigin, normalizedRayDirection, near, far, uStepSize, 0.01);
    pickedVoxel.a = step(0.01, pickedVoxel.a);
    gl_FragColor = pickedVoxel;
  #endif
}
