precision highp sampler3D;

in vec2 vUv;

uniform sampler3D uDataTexture;
uniform sampler2D uColorTexture;
uniform float uOpacity;

uniform vec3 uActiveSlices;
uniform vec3 uImageVoxelCount;

uniform vec3 uVoxelCount;

out vec4 pc_FragColor;

void main() {
  vec3 uv;
  #ifdef TRANSVERSE
    uv = vec3(vUv.xy, (uActiveSlices.z + 0.5) / uImageVoxelCount.z);
  #endif // TRANSVERSE
  #ifdef SAGITTAL
    uv = vec3((uActiveSlices.x + 0.5) / uImageVoxelCount.x, vUv.xy);
  #endif // SAGITTAL
  #ifdef CORONAL
    uv = vec3(vUv.x, (uActiveSlices.y + 0.5) / uImageVoxelCount.y, vUv.y);
  #endif // CORONAL
  
  vec4 data = texture(uDataTexture, uv);

  vec4 color = texture(uColorTexture, vec2(data.x, 0.5));

  pc_FragColor = vec4(color.rgb, color.a * uOpacity);
}
