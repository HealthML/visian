vec2 sliceSize = vec2(1.0) / uAtlasGrid;
vec2 delta = vec2(
  mod(floor(volumeCoords.z * uVoxelCount.z), uAtlasGrid.x), 
  floor(volumeCoords.z * uVoxelCount.z / uAtlasGrid.x)
);
vec2 uvDelta = sliceSize * delta;
vec2 uv = fract(volumeCoords.xy / uAtlasGrid + uvDelta);