varying vec2 vUv;

uniform sampler2D uVolume;
uniform sampler2D uInputFirstDerivative;
uniform sampler2D uInputSecondDerivative;
uniform sampler2D uFocus;
uniform bool uUseFocus;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;
uniform float uStepSize;
uniform vec3 uCameraPosition;
uniform float uOpacity;
uniform int uTransferFunction;
uniform float uConeAngle;

#define MAX_STEPS 16

@import ../utils/volume-data;
@import ../gradient/decode-gradient;
@import ../volume/transfer-functions;
@import ../utils/get-interpolated-volume-data;

vec4 getVolumeColor(vec3 volumeCoords) {
  VolumeData volumeData = getInterpolatedVolumeData(volumeCoords);
  vec4 volumeColor = transferFunction(volumeData, volumeCoords);
  return vec4(volumeColor.rgb, volumeColor.a * uOpacity);
}

@import ../utils/march-ray;

float getOpacity(vec3 origin, vec3 direction) {
  return marchRay(origin, direction, 0.01, 100.0, uStepSize).a;
}

void main() {
  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  vec2 sliceOffset = floor(vUv / sliceSize);
  float zSlice = uAtlasGrid.x * sliceOffset.y + sliceOffset.x;

  if (zSlice >= uVoxelCount.z) {
    gl_FragColor = vec4(vec3(0.0), 1.0);
    return;
  }

  vec2 offsetInSlice = fract(vUv / sliceSize);

  vec3 voxelCoords = vec3(offsetInSlice * uVoxelCount.xy, zSlice);
  vec3 origin = voxelCoords / uVoxelCount;

  vec3 directions[8];
  directions[0] = normalize(vec3(1.0, 1.0, 1.0));
  directions[1] = normalize(vec3(1.0, 1.0, -1.0));
  directions[2] = normalize(vec3(1.0, -1.0, 1.0));
  directions[3] = normalize(vec3(1.0, -1.0, -1.0));
  directions[4] = normalize(vec3(-1.0, 1.0, 1.0));
  directions[5] = normalize(vec3(-1.0, 1.0, -1.0));
  directions[6] = normalize(vec3(-1.0, -1.0, 1.0));
  directions[7] = normalize(vec3(-1.0, -1.0, -1.0));

  float brightness = 1.0;
  for (int i = 0; i < 8; ++i) {
    float rayOpacity = getOpacity(origin, directions[i]);
    brightness -= rayOpacity / 8.0;
  }

  gl_FragColor = vec4(vec3(brightness), 1.0);
}