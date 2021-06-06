varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

uniform float uSliceNumber;
uniform int uViewType;

void main() {
  vec3 volumeCoords;
  if(uViewType == 0) {
    volumeCoords = vec3(vUv.x, vUv.y, (uSliceNumber + 0.5) / uVoxelCount.z);
  } else if(uViewType == 1) {
    volumeCoords = vec3((uSliceNumber + 0.5) / uVoxelCount.x, vUv.x, vUv.y);
  } else {
    volumeCoords = vec3(vUv.x, (uSliceNumber + 0.5) / uVoxelCount.y, vUv.y);
  }
  
  @import ../utils/volume-coords-to-uv;

  gl_FragColor = texture2D(uDataTexture, uv);
}
