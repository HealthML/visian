precision highp sampler3D;

in vec2 vUv;

uniform float uThreshold;
uniform vec4 uSeed;
uniform int uComponents;

@import ../uniforms/u-blip-material;
@import ../uniforms/u-texture-3d-material;

out vec4 pc_FragColor;

@import ./can-grow-from;

void main() {
  #ifdef VOLUMETRIC_IMAGE
    vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  #else
    vec2 uv = vUv;
  #endif
  vec4 source = texture(uSourceTexture, uv);
  vec4 target = texture(uTargetTexture, uv);

  if (target.x > 0.0) {
    pc_FragColor = target;
    return;
  }

  @import ../utils/neighbor-uvs;

  // right, left, up, down, back, front
  vec4 sourceR = texture(uSourceTexture, uvR);
  vec4 sourceL = texture(uSourceTexture, uvL);
  vec4 sourceU = texture(uSourceTexture, uvU);
  vec4 sourceD = texture(uSourceTexture, uvD);
  #ifdef VOLUMETRIC_IMAGE
    vec4 sourceB = texture(uSourceTexture, uvB);
    vec4 sourceF = texture(uSourceTexture, uvF);
  #endif
  vec4 targetR = texture(uTargetTexture, uvR);
  vec4 targetL = texture(uTargetTexture, uvL);
  vec4 targetU = texture(uTargetTexture, uvU);
  vec4 targetD = texture(uTargetTexture, uvD);
  #ifdef VOLUMETRIC_IMAGE
    vec4 targetB = texture(uTargetTexture, uvB);
    vec4 targetF = texture(uTargetTexture, uvF);
  #endif

  // right, left, up, down, back, front
  bool canGrowFromR = uv.x < 1.0 - texelStep.x && canGrowFrom(source, sourceR, targetR.x);
  bool canGrowFromL = uv.x >= texelStep.x && canGrowFrom(source, sourceL, targetL.x);
  bool canGrowFromU = uv.y < 1.0 - texelStep.y && canGrowFrom(source, sourceU, targetU.x);
  bool canGrowFromD = uv.y >= texelStep.y && canGrowFrom(source, sourceD, targetD.x);
  #ifdef VOLUMETRIC_IMAGE
    bool canGrowFromB = uv.z < 1.0 - texelStep.z && canGrowFrom(source, sourceB, targetB.x);
    bool canGrowFromF = uv.z >= texelStep.z && canGrowFrom(source, sourceF, targetF.x);
  #else
    bool canGrowFromB = false;
    bool canGrowFromF = false;
  #endif

  bool shouldGrow = canGrowFromR || canGrowFromL || canGrowFromU || canGrowFromD || canGrowFromB || canGrowFromF;

  if(!shouldGrow) discard;

  pc_FragColor = vec4(vec3(uRenderValue), 1.0);
}
