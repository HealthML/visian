vec2 sliceSize = vec2(1.0) / uAtlasGrid;
vec2 sliceOffset = vec2(
  mod(floor(volumeCoords.z * uVoxelCount.z), uAtlasGrid.x), 
  floor(volumeCoords.z * uVoxelCount.z / uAtlasGrid.x)
);
vec2 uvOffset = sliceSize * sliceOffset;
vec2 uv = fract(volumeCoords.xy / uAtlasGrid + uvOffset);
