varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform sampler2D uRegionTexture;

uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

uniform float uThreshold;
uniform float uSeed;

bool canGrowFrom(float ownData, float neightborData, float neightborRegion) {
  return neightborRegion > 0.0 &&
    abs(ownData - uSeed) <= 1.5 * uThreshold &&
    abs(ownData - neightborData) <= uThreshold;
}

void main() {
  vec4 data = texture2D(uDataTexture, vUv);
  vec4 region = texture2D(uRegionTexture, vUv);

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

  vec2 uvR = vec2(vUv.x + texelStep.x, vUv.y);
  vec2 uvL = vec2(vUv.x - texelStep.x, vUv.y);

  vec2 uvU = vec2(vUv.x, vUv.y + texelStep.y);
  vec2 uvD = vec2(vUv.x, vUv.y - texelStep.y);
  
  float lastInSliceRow = clamp(sliceTilePosition.x - uAtlasGrid.x + 2.0, 0.0, 1.0);
  vec2 uvOffsetB = mix(
    vec2(sliceSize.x, 0.0), 
    vec2(-sliceSize.x * (uAtlasGrid.x - 1.0), sliceSize.y), 
    lastInSliceRow
  );
  vec2 uvB = vUv + uvOffsetB;

  float firstInSliceRow = clamp(1.0 - sliceTilePosition.x , 0.0, 1.0);
  vec2 uvOffsetF = mix(
    vec2(-sliceSize.x, 0.0), 
    vec2(sliceSize.x * (uAtlasGrid.x - 1.0), -sliceSize.y), 
    firstInSliceRow
  );
  vec2 uvF = vUv + uvOffsetF;

  vec4 regionR = texture2D(uRegionTexture, uvR);
  vec4 regionL = texture2D(uRegionTexture, uvL);
  vec4 regionU = texture2D(uRegionTexture, uvU);
  vec4 regionD = texture2D(uRegionTexture, uvD);
  vec4 regionB = texture2D(uRegionTexture, uvB);
  vec4 regionF = texture2D(uRegionTexture, uvF);
  vec4 dataR = texture2D(uDataTexture, uvR);
  vec4 dataL = texture2D(uDataTexture, uvL);
  vec4 dataU = texture2D(uDataTexture, uvU);
  vec4 dataD = texture2D(uDataTexture, uvD);
  vec4 dataB = texture2D(uDataTexture, uvB);
  vec4 dataF = texture2D(uDataTexture, uvF);

  bool canGrowFromR = voxelCoords.x < uVoxelCount.x - 1.0 && canGrowFrom(data.x, dataR.x, regionR.x);
  bool canGrowFromL = voxelCoords.x > 0.0 && canGrowFrom(data.x, dataL.x, regionL.x);
  bool canGrowFromU = voxelCoords.y < uVoxelCount.y - 1.0 && canGrowFrom(data.x, dataU.x, regionU.x);
  bool canGrowFromD = voxelCoords.y > 0.0 && canGrowFrom(data.x, dataD.x, regionD.x);
  bool canGrowFromB = voxelCoords.z < uVoxelCount.z - 1.0 && canGrowFrom(data.x, dataB.x, regionB.x);
  bool canGrowFromF = voxelCoords.z > 0.0 && canGrowFrom(data.x, dataF.x, regionF.x);

  bool shouldGrow = canGrowFromR || canGrowFromL || canGrowFromU || canGrowFromD || canGrowFromB || canGrowFromF;

  if(!shouldGrow && region.x == 0.0) discard;

  gl_FragColor = vec4(1.0);
}