uniform vec2 uAtlasGrid;
uniform vec3 uVoxelCount;
uniform int uViewType;

varying vec2 vUv;

void main() {
  if(uViewType == 0) {
    vUv = (position.xy + 0.5) / uVoxelCount.xy;
  } else if(uViewType == 1) {
    vUv = (position.yz + 0.5) / uVoxelCount.yz;
  } else {
    vUv = (position.xz + 0.5) / uVoxelCount.xz;
  }

  @import ../utils/atlas-position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(atlasPosition, 0.0, 1.0);
}
