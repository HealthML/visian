uniform vec2 uAtlasGrid;
uniform vec3 uVoxelCount;

attribute vec3 color;

varying vec3 vColor;

void main() {
  vColor = color;

  vec2 delta = vec2(
    mod(position.z, uAtlasGrid.x), 
    floor(position.z / uAtlasGrid.x)
  );

  vec2 atlasPosition = delta * uVoxelCount.xy + position.xy;

  if(
    position.x < 0.0 ||
    position.y < 0.0 ||
    position.z < 0.0 ||
    position.x >= uVoxelCount.x ||
    position.y >= uVoxelCount.y ||
    position.z >= uVoxelCount.z
  ) {
    // Trash voxels that are out of bounds.
    atlasPosition = vec2(-1.0, -1.0);
  }

  gl_PointSize = 1.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(atlasPosition, 0.0, 1.0);
}
