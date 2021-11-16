precision highp sampler3D;

in vec2 vUv;

uniform sampler3D uSourceTexture;

@import ../uniforms/u-texture-3d-material;

out vec4 pc_FragColor;

void main() {
  vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  pc_FragColor = texture(uSourceTexture, uv);
}
