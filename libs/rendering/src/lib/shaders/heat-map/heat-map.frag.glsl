varying vec2 vUv;

uniform sampler2D uDataTexture;

uniform vec3 uActiveSlices;
uniform vec3 uImageVoxelCount;

uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

void main() {
  vec3 volumeCoords;
  #ifdef TRANSVERSE
    volumeCoords = vec3(vUv.x, vUv.y, (uActiveSlices.z + 0.5) / uImageVoxelCount.z);
  #endif // TRANSVERSE
  #ifdef SAGITTAL
    volumeCoords = vec3((uActiveSlices.x + 0.5) / uImageVoxelCount.x, vUv.x, vUv.y);
  #endif // SAGITTAL
  #ifdef CORONAL
    volumeCoords = vec3(vUv.x, (uActiveSlices.y + 0.5) / uImageVoxelCount.y, vUv.y);
  #endif // CORONAL

  @import ../utils/volume-coords-to-uv;
  
  vec4 data = texture2D(uDataTexture, uv);

  gl_FragColor = vec4(1.0, 0.0, 0.0, data.x);
}
