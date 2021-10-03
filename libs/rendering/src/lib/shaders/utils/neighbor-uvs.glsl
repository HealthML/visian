vec2 sliceSize = vec2(1.0) / uAtlasGrid;
vec2 sliceTilePosition = floor(vUv / sliceSize);
float z = uAtlasGrid.x * sliceTilePosition.y + sliceTilePosition.x;

if (z >= uVoxelCount.z) {
  gl_FragColor = vec4(vec3(0.0), 1.0);
  return;
}

vec2 offsetInSlice = fract(vUv / sliceSize);
vec3 voxelCoords = vec3(offsetInSlice * uVoxelCount.xy, z);

vec2 texelStep = vec2(1.0) / (uAtlasGrid * uVoxelCount.xy);

// right, left
vec2 uvR = vec2(vUv.x + texelStep.x, vUv.y);
vec2 uvL = vec2(vUv.x - texelStep.x, vUv.y);

// up, down
vec2 uvU = vec2(vUv.x, vUv.y + texelStep.y);
vec2 uvD = vec2(vUv.x, vUv.y - texelStep.y);

float lastInSliceRow = clamp(sliceTilePosition.x - uAtlasGrid.x + 2.0, 0.0, 1.0);
vec2 uvOffsetB = mix(
  vec2(sliceSize.x, 0.0), 
  vec2(-sliceSize.x * (uAtlasGrid.x - 1.0), sliceSize.y), 
  lastInSliceRow
);
// back
vec2 uvB = vUv + uvOffsetB;

float firstInSliceRow = clamp(1.0 - sliceTilePosition.x , 0.0, 1.0);
vec2 uvOffsetF = mix(
  vec2(-sliceSize.x, 0.0), 
  vec2(sliceSize.x * (uAtlasGrid.x - 1.0), -sliceSize.y), 
  firstInSliceRow
);
// front
vec2 uvF = vUv + uvOffsetF;