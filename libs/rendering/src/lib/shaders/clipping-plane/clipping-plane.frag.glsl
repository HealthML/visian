precision highp sampler3D;

in vec3 vVolumeCoords;

#define VOLUMETRIC_IMAGE
@import ../uniforms/u-common;
@import ../uniforms/u-image-info;

uniform int uComponents;

out vec4 pc_FragColor;

void main() {
  vec3 volumeCoords = vVolumeCoords;

  if(
    volumeCoords.x < 0.0 || volumeCoords.y < 0.0 || volumeCoords.z < 0.0 ||
    volumeCoords.x > 1.0 || volumeCoords.y > 1.0 || volumeCoords.z > 1.0 
  ) {
      discard;
    }

  vec4 imageValue = vec4(0.0);
  {{reduceEnhancedLayerStack(imageValue, volumeCoords)}}

  if(imageValue.a < 0.01) discard;

  #ifndef VOXEL_PICKING
    imageValue.rgb *= imageValue.a;
    imageValue.a = 1.0;
  #else
    imageValue.rgb = volumeCoords;
    imageValue.a = step(0.01, imageValue.a);
  #endif

  pc_FragColor = imageValue;
}
