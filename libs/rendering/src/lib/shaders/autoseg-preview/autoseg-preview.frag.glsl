precision highp sampler3D;

in vec2 vUv;

@import ../uniforms/u-tool-3d-material;

out vec4 pc_FragColor;

void main() {
  #ifdef VOLUMETRIC_IMAGE
    vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  #else
    vec2 uv = vUv;
  #endif

  vec4 source = texture(uSourceTexture, uv);
  pc_FragColor = vec4(source[0] < 0.5 ? 0.0 : 1.0);
}
