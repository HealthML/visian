varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform sampler2D uRegionTexture;
uniform vec2 uRegionSize;
uniform float uThreshold;
uniform vec4 uSeed;
uniform int uComponents;
uniform vec2 uMinUv;
uniform vec2 uMaxUv;

@import ./can-grow-from;

void main() {
  if(vUv.x < uMinUv.x || vUv.x > uMaxUv.x || vUv.y < uMinUv.y || vUv.y > uMaxUv.y) discard;
  
  vec4 data = texture2D(uDataTexture, vUv);
  vec4 region = texture2D(uRegionTexture, vUv);

  vec2 texelStep = vec2(1.0) / uRegionSize;

  vec2 uvN = vec2(vUv.x, vUv.y + texelStep.y);
  vec2 uvNE = vUv + texelStep;
  vec2 uvE = vec2(vUv.x + texelStep.x, vUv.y);
  vec2 uvSE = vec2(vUv.x + texelStep.x, vUv.y - texelStep.y);
  vec2 uvS = vec2(vUv.x, vUv.y - texelStep.y);
  vec2 uvSW = vUv - texelStep;
  vec2 uvW = vec2(vUv.x - texelStep.x, vUv.y);
  vec2 uvNW = vec2(vUv.x - texelStep.x, vUv.y + texelStep.y);

  vec4 regionN = texture2D(uRegionTexture, uvN);
  vec4 regionNE = texture2D(uRegionTexture, uvNE);
  vec4 regionE = texture2D(uRegionTexture, uvE);
  vec4 regionSE = texture2D(uRegionTexture, uvSE);
  vec4 regionS = texture2D(uRegionTexture, uvS);
  vec4 regionSW = texture2D(uRegionTexture, uvSW);
  vec4 regionW = texture2D(uRegionTexture, uvW);
  vec4 regionNW = texture2D(uRegionTexture, uvNW);
  vec4 dataN = texture2D(uDataTexture, uvN);
  vec4 dataNE = texture2D(uDataTexture, uvNE);
  vec4 dataE = texture2D(uDataTexture, uvE);
  vec4 dataSE = texture2D(uDataTexture, uvSE);
  vec4 dataS = texture2D(uDataTexture, uvS);
  vec4 dataSW = texture2D(uDataTexture, uvSW);
  vec4 dataW = texture2D(uDataTexture, uvW);
  vec4 dataNW = texture2D(uDataTexture, uvNW);


  // For some reason this shader freezes on iPad if we use 7 or more bools for
  // one big || concatination. Using two bools which concat 4 bools each it works.
  bool shouldGrow1 = canGrowFrom(data, dataN, regionN.x) ||
    canGrowFrom(data, dataNE, regionNE.x) ||
    canGrowFrom(data, dataE, regionE.x) ||
    canGrowFrom(data, dataSE, regionSE.x);

  bool shouldGrow2 = canGrowFrom(data, dataS, regionS.x) ||
    canGrowFrom(data, dataSW, regionSW.x) ||
    canGrowFrom(data, dataW, regionW.x) ||
    canGrowFrom(data, dataNW, regionNW.x);

  if(!shouldGrow1 && !shouldGrow2 && region.x == 0.0) discard;

  gl_FragColor = vec4(1.0);
}
