precision highp sampler3D;

in vec2 vUv;

#ifdef TWO_D
  uniform sampler2D uSourceTexture;
#else
  uniform sampler3D uSourceTexture;
  @import ../uniforms/u-texture-3d-material;
#endif

out vec4 pc_FragColor;

void main() {
  #ifdef TWO_D
    vec2 uv = vUv;
  #else
    vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  #endif

  pc_FragColor = texture(uSourceTexture, uv);
}
