varying vec3 vVolumeCoords;

@import ../uniforms/u-common;
@import ../uniforms/u-atlas-info;
@import ../uniforms/u-image-info;

uniform int uComponents;


void main() {
  vec3 volumeCoords = vVolumeCoords;

  if(
    volumeCoords.x < 0.0 || volumeCoords.y < 0.0 || volumeCoords.z < 0.0 ||
    volumeCoords.x > 1.0 || volumeCoords.y > 1.0 || volumeCoords.z > 1.0 
  ) {
      discard;
    }
  
  @import ../utils/volume-coords-to-uv;

  vec4 imageValue = vec4(0.0);
  {{reduceEnhancedLayerStack(imageValue, uv)}}

  if(imageValue.a < 0.01) discard;

  imageValue.rgb *= imageValue.a;
  imageValue.a = 1.0;
  gl_FragColor = imageValue;
}