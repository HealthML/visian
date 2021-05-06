vec2 delta = vec2(
  mod(position.z, uAtlasGrid.x), 
  floor(position.z / uAtlasGrid.x)
);

// TODO: Why does this case even happpen?
if (delta.x == uAtlasGrid.x) {
  delta.x = 0.0;
  delta.y += 1.0;
}

vec2 atlasPosition = delta * uVoxelCount.xy + position.xy;
