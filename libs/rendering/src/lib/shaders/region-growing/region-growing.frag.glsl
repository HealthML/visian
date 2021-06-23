varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform sampler2D uRegionTexture;
uniform vec2 uRegionSize;
uniform float uThreshold;
uniform float uSeed;
uniform vec2 uMinUv;
uniform vec2 uMaxUv;

bool canGrowFrom(float ownData, float neightborData, float neightborRegion) {
  return neightborRegion > 0.0 &&
    abs(ownData - uSeed) <= 1.5 * uThreshold &&
    abs(ownData - neightborData) <= uThreshold;
}

void main() {
  if(vUv.x < uMinUv.x || vUv.x > uMaxUv.x || vUv.y < uMinUv.y || vUv.y > uMaxUv.y) discard;
  
  vec4 data = texture2D(uDataTexture, vUv);
  vec4 region = texture2D(uRegionTexture, vUv);

  vec2 texelStep = vec2(1.0) / uRegionSize;

  vec2 uvN = vec2(vUv.x, vUv.y + texelStep.y);
  vec2 uvNO = vUv + texelStep;
  vec2 uvO = vec2(vUv.x + texelStep.x, vUv.y);
  vec2 uvSO = vec2(vUv.x + texelStep.x, vUv.y - texelStep.y);
  vec2 uvS = vec2(vUv.x, vUv.y - texelStep.y);
  vec2 uvSW = vUv - texelStep;
  vec2 uvW = vec2(vUv.x - texelStep.x, vUv.y);
  vec2 uvNW = vec2(vUv.x - texelStep.x, vUv.y + texelStep.y);

  vec4 regionN = texture2D(uRegionTexture, uvN);
  vec4 regionNO = texture2D(uRegionTexture, uvNO);
  vec4 regionO = texture2D(uRegionTexture, uvO);
  vec4 regionSO = texture2D(uRegionTexture, uvSO);
  vec4 regionS = texture2D(uRegionTexture, uvS);
  vec4 regionSW = texture2D(uRegionTexture, uvSW);
  vec4 regionW = texture2D(uRegionTexture, uvW);
  vec4 regionNW = texture2D(uRegionTexture, uvNW);
  vec4 dataN = texture2D(uDataTexture, uvN);
  vec4 dataNO = texture2D(uDataTexture, uvNO);
  vec4 dataO = texture2D(uDataTexture, uvO);
  vec4 dataSO = texture2D(uDataTexture, uvSO);
  vec4 dataS = texture2D(uDataTexture, uvS);
  vec4 dataSW = texture2D(uDataTexture, uvSW);
  vec4 dataW = texture2D(uDataTexture, uvW);
  vec4 dataNW = texture2D(uDataTexture, uvNW);


  // For some reason this shader freezes on iPad if we use 7 or more bools for
  // one big || concatination. Using two bools which concat 4 bools each it works.
  bool shouldGrow1 = canGrowFrom(data.x, dataN.x, regionN.x) ||
    canGrowFrom(data.x, dataNO.x, regionNO.x) ||
    canGrowFrom(data.x, dataO.x, regionO.x) ||
    canGrowFrom(data.x, dataSO.x, regionSO.x);

  bool shouldGrow2 = canGrowFrom(data.x, dataS.x, regionS.x) ||
    canGrowFrom(data.x, dataSW.x, regionSW.x) ||
    canGrowFrom(data.x, dataW.x, regionW.x) ||
    canGrowFrom(data.x, dataNW.x, regionNW.x);

  if(!shouldGrow1 && !shouldGrow2 && region.x == 0.0) discard;

  gl_FragColor = vec4(1.0);
}
