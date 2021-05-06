vec2 sliceOffset = vec2(
  mod(position.z, uAtlasGrid.x), 
  floor(position.z / uAtlasGrid.x)
);

// TODO: Why does this case even happpen?
if (sliceOffset.x == uAtlasGrid.x) {
  sliceOffset.x = 0.0;
  sliceOffset.y += 1.0;
}

vec2 atlasPosition = sliceOffset * uVoxelCount.xy + position.xy;
