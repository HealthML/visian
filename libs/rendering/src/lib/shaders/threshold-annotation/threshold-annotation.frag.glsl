precision highp sampler3D;

in vec2 vUv;

uniform vec2 uThreshold;

@import ../uniforms/u-blip-material;
@import ../uniforms/u-texture-3d-material;

out vec4 pc_FragColor;

void main() {
  #ifdef VOLUMETRIC_IMAGE
    vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);
  #else
    vec2 uv = vUv;
  #endif

  vec4 source = texture(uSourceTexture, uv);
  pc_FragColor = vec4(step(uThreshold.x, source.r) * step(source.r, uThreshold.y));
}
