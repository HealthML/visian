varying vec2 vUv;

uniform sampler2D uSourceTexture;
uniform sampler2D uTargetTexture;

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
  vec4 source = texture2D(uSourceTexture, vUv);
  vec4 target = texture2D(uTargetTexture, vUv);

  if (target.x > 0.0) {
    gl_FragColor = target;
    return;
  }

  @import ../utils/neighbor-uvs;

  // right, left, up, down, back, front
  vec4 sourceR = texture2D(uSourceTexture, uvR);
  vec4 sourceL = texture2D(uSourceTexture, uvL);
  vec4 sourceU = texture2D(uSourceTexture, uvU);
  vec4 sourceD = texture2D(uSourceTexture, uvD);
  vec4 sourceB = texture2D(uSourceTexture, uvB);
  vec4 sourceF = texture2D(uSourceTexture, uvF);
  vec4 targetR = texture2D(uTargetTexture, uvR);
  vec4 targetL = texture2D(uTargetTexture, uvL);
  vec4 targetU = texture2D(uTargetTexture, uvU);
  vec4 targetD = texture2D(uTargetTexture, uvD);
  vec4 targetB = texture2D(uTargetTexture, uvB);
  vec4 targetF = texture2D(uTargetTexture, uvF);

  // right, left, up, down, back, front
  bool canGrowFromR = voxelCoords.x < uVoxelCount.x - 1.0 && canGrowFrom(source.x, sourceR.x, targetR.x);
  bool canGrowFromL = voxelCoords.x >= 1.0 && canGrowFrom(source.x, sourceL.x, targetL.x);
  bool canGrowFromU = voxelCoords.y < uVoxelCount.y - 1.0 && canGrowFrom(source.x, sourceU.x, targetU.x);
  bool canGrowFromD = voxelCoords.y >= 1.0 && canGrowFrom(source.x, sourceD.x, targetD.x);
  bool canGrowFromB = voxelCoords.z < uVoxelCount.z - 1.0 && canGrowFrom(source.x, sourceB.x, targetB.x);
  bool canGrowFromF = voxelCoords.z >= 1.0 && canGrowFrom(source.x, sourceF.x, targetF.x);

  bool shouldGrow = canGrowFromR || canGrowFromL || canGrowFromU || canGrowFromD || canGrowFromB || canGrowFromF;

  if(!shouldGrow) discard;

  gl_FragColor = vec4(vec3(uRenderValue), 1.0);
}
