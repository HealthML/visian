precision highp sampler3D;

in vec2 vUv;

@import ../uniforms/u-blip-material;
@import ../uniforms/u-texture-3d-material;

uniform sampler3D uDataTexture;
out vec4 pc_FragColor;

void main() {
  #ifdef VOLUMETRIC_IMAGE
    vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  #else
    vec2 uv = vUv;
  #endif

  vec4 partOfMask = texture(uDataTexture, uv);

  if (partOfMask[0] < 0.5) {
    discard;
  }

  pc_FragColor = vec4(1.0);
}
