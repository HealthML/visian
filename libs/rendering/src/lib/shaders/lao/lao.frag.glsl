precision highp sampler3D;

in vec2 vUv;

#define VOLUMETRIC_IMAGE
@import ../uniforms/u-opacity;
@import ../uniforms/u-common;
@import ../uniforms/u-image-info;
@import ../uniforms/u-transfer-functions;
@import ../uniforms/u-texture-3d-material;

uniform sampler3D uPreviousFrame;
uniform sampler2D uDirections;
uniform int uPreviousDirections;
uniform int uTotalDirections;

out vec4 pc_FragColor;

#define MAX_STEPS 16

@import ../utils/volume-data;
@import ../utils/decode-vec3;
@import ../volume/transfer-functions;
@import ../utils/get-volume-data;

vec4 getVolumeColor(vec3 volumeCoords) {
  VolumeData volumeData = getVolumeData(volumeCoords);
  vec4 volumeColor = transferFunction(volumeData, volumeCoords);
  return vec4(volumeColor.rgb, volumeColor.a * uOpacity);
}

@import ../utils/march-ray;

float getOpacity(vec3 origin, vec3 direction) {
  return marchRay(origin, direction, 0.01, 100.0, uStepSize).a;
}

vec2 getTextureCoordsForDirection(int index) {
  return vec2((float(index) + 0.5) / float(uTotalDirections), 0.5);
}

void main() {
  vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  vec3 origin = uv;

  vec3 directions[8];
  directions[0] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 0)));
  directions[1] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 1)));
  directions[2] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 2)));
  directions[3] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 3)));
  directions[4] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 4)));
  directions[5] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 5)));
  directions[6] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 6)));
  directions[7] = decodeVec3(texture(uDirections, getTextureCoordsForDirection(uPreviousDirections + 7)));

  float brightness = 1.0;
  for (int i = 0; i < 8; ++i) {
    float rayOpacity = getOpacity(origin, directions[i]);
    brightness -= rayOpacity / 8.0;
  }

  if(uPreviousDirections == 0) {
    pc_FragColor = vec4(vec3(brightness), 1.0);
    return;
  }

  float previousFrame = texture(uPreviousFrame, uv).x;

  float combinedBrightness = (previousFrame * float(uPreviousDirections) + brightness * 8.0) / (float(uPreviousDirections) + 8.0);
  pc_FragColor = vec4(vec3(combinedBrightness), 1.0);
}