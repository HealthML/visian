varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform sampler2D uRegionTexture;

uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

uniform float uThreshold;
uniform float uSeed;

uniform float uRenderValue;

const float two_over_three = 2.0 / 3.0;

bool canGrowFrom(float ownData, float neighborData, float neighborRegion) {
  return all(lessThan(vec3(
      -neighborRegion,
      abs(ownData - uSeed) * two_over_three - uThreshold,
      abs(ownData - neighborData) - uThreshold),
    vec3(0.0)));
}

void main() {
  vec4 data = texture2D(uDataTexture, vUv);
  vec4 region = texture2D(uRegionTexture, vUv);

  if (region.x > 0.0) {
    gl_FragColor = region;
    return;
  }

  @import ../utils/neighbor-uvs;

  // right, left, up, down, back, front
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

  // right, left, up, down, back, front
  bool canGrowFromR = voxelCoords.x < uVoxelCount.x - 1.0 && canGrowFrom(data.x, dataR.x, regionR.x);
  bool canGrowFromL = voxelCoords.x >= 1.0 && canGrowFrom(data.x, dataL.x, regionL.x);
  bool canGrowFromU = voxelCoords.y < uVoxelCount.y - 1.0 && canGrowFrom(data.x, dataU.x, regionU.x);
  bool canGrowFromD = voxelCoords.y >= 1.0 && canGrowFrom(data.x, dataD.x, regionD.x);
  bool canGrowFromB = voxelCoords.z < uVoxelCount.z - 1.0 && canGrowFrom(data.x, dataB.x, regionB.x);
  bool canGrowFromF = voxelCoords.z >= 1.0 && canGrowFrom(data.x, dataF.x, regionF.x);

  bool shouldGrow = canGrowFromR || canGrowFromL || canGrowFromU || canGrowFromD || canGrowFromB || canGrowFromF;

  if(!shouldGrow) discard;

  gl_FragColor = vec4(vec3(uRenderValue), 1.0);
}
