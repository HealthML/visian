precision highp sampler3D;

in vec2 vUv;

uniform sampler3D uDataTexture;
uniform vec3 uVoxelCount;

uniform float uSliceNumber;
uniform int uViewType;

out vec4 pc_FragColor;

void main() {
  vec3 volumeCoords;
  if(uViewType == 0) {
    volumeCoords = vec3(vUv.x, vUv.y, (uSliceNumber + 0.5) / uVoxelCount.z);
  } else if(uViewType == 1) {
    volumeCoords = vec3((uSliceNumber + 0.5) / uVoxelCount.x, vUv.x, vUv.y);
  } else {
    volumeCoords = vec3(vUv.x, (uSliceNumber + 0.5) / uVoxelCount.y, vUv.y);
  }

  pc_FragColor = texture(uDataTexture, volumeCoords);
}
