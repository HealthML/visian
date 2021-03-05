varying vec2 vUv;

uniform sampler2D uTextureAtlas;
uniform vec3 uVoxelSpacing;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

/**
 * Returns the image value at the given volume coordinates.
 *
 * @param voxelCoords The voxel coordinates (ranged [0, uVoxelCount.*]).
 */
vec4 getImageValue(vec3 voxelCoords) {
  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  vec2 sliceOffset = vec2(
    mod(voxelCoords.z, uAtlasGrid.x), 
    floor(voxelCoords.z / uAtlasGrid.x)
  );

  // TODO: Why does this case even happpen?
  if(sliceOffset.x == uAtlasGrid.x) {
    sliceOffset.x = 0.0;
    sliceOffset.y += 1.0;
  }

  vec2 uvOffset = sliceSize * sliceOffset;
  vec2 uv = ((voxelCoords.xy + vec2(0.5)) / uVoxelCount.xy / uAtlasGrid + uvOffset);
  return texture2D(uTextureAtlas, uv);
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

  vec3 up = vec3(0.0);
  vec3 down = vec3(0.0);

  up.x = getImageValue(vec3(min(uVoxelCount.x - 1.0, voxelCoords.x + 1.0), voxelCoords.yz)).x;
  down.x = getImageValue(vec3(max(0.0, voxelCoords.x - 1.0), voxelCoords.yz)).x;

  up.y = getImageValue(vec3(voxelCoords.x, min(uVoxelCount.y - 1.0, voxelCoords.y + 1.0), voxelCoords.z)).x;
  down.y = getImageValue(vec3(voxelCoords.x, max(0.0, voxelCoords.y - 1.0), voxelCoords.z)).x;

  up.z = getImageValue(vec3(voxelCoords.xy, min(uVoxelCount.z - 1.0, voxelCoords.z + 1.0))).x;
  down.z = getImageValue(vec3(voxelCoords.xy, max(0.0, voxelCoords.z - 1.0))).x;

  vec3 gradient = (up - down) / (mix(vec3(1.0), vec3(2.0), step(0.5, mod(voxelCoords, uVoxelCount - vec3(1.0)))) * uVoxelSpacing);

  gl_FragColor = vec4(abs(gradient) * 10.0, 1.0);
}