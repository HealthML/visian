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

  gl_PointSize = 1.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(atlasPosition, 0.0, 1.0);
}
