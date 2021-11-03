precision highp sampler3D;

in vec2 vUv;

uniform bool uShouldErode;

@import ../uniforms/u-blip-material;
@import ../uniforms/u-texture-3d-material;

out vec4 pc_FragColor;

// TODO: Eliminate code duplication (see region growing 3D fragment shader)
void main() {
  #ifdef VOLUMETRIC_IMAGE
    vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  #else
    vec2 uv = vUv;
  #endif
  vec4 target = texture(uTargetTexture, uv);

  @import ../utils/neighbor-uvs;

  // right, left, up, down, back, front
  vec4 targetR = texture(uTargetTexture, uvR);
  vec4 targetL = texture(uTargetTexture, uvL);
  vec4 targetU = texture(uTargetTexture, uvU);
  vec4 targetD = texture(uTargetTexture, uvD);
  #ifdef VOLUMETRIC_IMAGE
    vec4 targetB = texture(uTargetTexture, uvB);
    vec4 targetF = texture(uTargetTexture, uvF);
  #endif

  if (uShouldErode) {
    #ifdef VOLUMETRIC_IMAGE
      pc_FragColor = vec4(vec3(min(target, min(targetR, min(targetL, min(targetU, min(targetD, min(targetB, targetF))))))), 1.0);
    #else
      pc_FragColor = vec4(vec3(min(target, min(targetR, min(targetL, min(targetU, targetD))))), 1.0);
    #endif
  } else {
    #ifdef VOLUMETRIC_IMAGE
      pc_FragColor = vec4(vec3(max(target, max(targetR, max(targetL, max(targetU, max(targetD, max(targetB, targetF))))))), 1.0);
    #else
      pc_FragColor = vec4(vec3(max(target, max(targetR, max(targetL, max(targetU, targetD))))), 1.0);
    #endif
  }
}
