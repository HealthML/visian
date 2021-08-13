varying vec2 vUv;

uniform sampler2D uLayerData[{{layerCount}}];
uniform bool uLayerAnnotationStatuses[{{layerCount}}];
uniform float uLayerOpacities[{{layerCount}}];
uniform vec3 uLayerColors[{{layerCount}}];

uniform vec3 uActiveSlices;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

uniform float uContrast;
uniform float uBrightness;
uniform int uComponents;

uniform sampler2D uActiveLayerData;
uniform float uPreviewThreshold;

vec4 applyBrightnessContrast(vec4 image) {
  if(uComponents >= 3) {
    return vec4(
      uBrightness * pow(image.rgb, vec3(uContrast)),
      image.a
    );
  }

  float contrastedIntensity = uBrightness * pow(image.a, uContrast);
  return vec4(image.rgb, contrastedIntensity);
}

void main() {
  vec3 volumeCoords;
  #ifdef TRANSVERSE
    volumeCoords = vec3(vUv.x, vUv.y, (uActiveSlices.z + 0.5) / uVoxelCount.z);
  #endif // TRANSVERSE
  #ifdef SAGITTAL
    volumeCoords = vec3((uActiveSlices.x + 0.5) / uVoxelCount.x, vUv.x, vUv.y);
  #endif // SAGITTAL
  #ifdef CORONAL
    volumeCoords = vec3(vUv.x, (uActiveSlices.y + 0.5) / uVoxelCount.y, vUv.y);
  #endif // CORONAL

  @import ../utils/volume-coords-to-uv;
  
  vec4 imageValue = vec4(0.0);
  {{reduceEnhancedLayerStack(imageValue, uv, applyBrightnessContrast)}}

  gl_FragColor = imageValue;
}
