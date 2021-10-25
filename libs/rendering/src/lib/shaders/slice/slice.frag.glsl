precision highp sampler3D;

in vec2 vUv;

{{layerData}}
uniform bool uLayerAnnotationStatuses[{{layerCount}}];
uniform float uLayerOpacities[{{layerCount}}];
uniform vec3 uLayerColors[{{layerCount}}];

uniform vec3 uActiveSlices;
uniform vec3 uVoxelCount;

uniform float uContrast;
uniform float uBrightness;
uniform int uComponents;

uniform sampler3D uActiveLayerData;
uniform float uRegionGrowingThreshold;

uniform sampler2D uToolPreview;
uniform int uToolPreviewMerge;
uniform int uActiveLayerIndex;

out vec4 pc_FragColor;

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

  vec4 toolPreview = texture(uToolPreview, vUv);
  
  vec4 imageValue = vec4(0.0);
  {{reduceEnhancedLayerStack(imageValue, volumeCoords, toolPreview, applyBrightnessContrast)}}

  pc_FragColor = imageValue;
}
