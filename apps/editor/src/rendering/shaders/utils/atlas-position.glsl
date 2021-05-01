vec2 delta = vec2(
  mod(position.z, uAtlasGrid.x), 
  floor(position.z / uAtlasGrid.x)
);

vec2 atlasPosition = delta * uVoxelCount.xy + position.xy;
