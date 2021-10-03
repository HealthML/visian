varying vec2 vUv;

uniform sampler2D uTargetTexture;

uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

uniform bool uShouldErode;

// TODO: Eliminate code duplication (see region growing 3D fragment shader)
void main() {
  vec4 target = texture2D(uTargetTexture, vUv);

  @import ../utils/neighbor-uvs;

  // right, left, up, down, back, front
  vec4 targetR = texture2D(uTargetTexture, uvR);
  vec4 targetL = texture2D(uTargetTexture, uvL);
  vec4 targetU = texture2D(uTargetTexture, uvU);
  vec4 targetD = texture2D(uTargetTexture, uvD);
  vec4 targetB = texture2D(uTargetTexture, uvB);
  vec4 targetF = texture2D(uTargetTexture, uvF);

  if (uShouldErode) {
    gl_FragColor = vec4(vec3(min(target, min(targetR, min(targetL, min(targetU, min(targetD, min(targetB, targetF))))))), 1.0);
  } else {
    gl_FragColor = vec4(vec3(max(target, max(targetR, max(targetL, max(targetU, max(targetD, max(targetB, targetF))))))), 1.0);
  }
}
