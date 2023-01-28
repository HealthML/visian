precision highp sampler3D;

in vec2 vUv;

#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uLayerData[{{layerCount}}];
#else 
  uniform sampler2D uLayerData[{{layerCount}}];
#endif
uniform bool uLayerAnnotationStatuses[{{layerCount}}];
uniform float uLayerOpacities[{{layerCount}}];
uniform vec3 uLayerColors[{{layerCount}}];

uniform vec3 uActiveSlices;
uniform vec3 uVoxelCount;

uniform float uContrast;
uniform float uBrightness;
uniform vec2 uWindow;
uniform int uComponents;

uniform bool uUseExclusiveSegmentations;

#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uActiveLayerData;
#else
  uniform sampler2D uActiveLayerData;
#endif
uniform float uRegionGrowingThreshold;

uniform sampler2D uToolPreview;
uniform int uToolPreviewMerge;
uniform int uActiveLayerIndex;

#ifdef BACKGROUND_BLEND
  uniform vec3 uBackgroundColor;
#endif

out vec4 pc_FragColor;

vec4 applyEnhancements(vec4 image) {
  if(uComponents >= 3) {
    return vec4(
      uBrightness * pow(image.rgb, vec3(uContrast)),
      image.a
    );
  }

  float windowedIntensity = clamp((image.a - uWindow[0]) / (uWindow[1] - uWindow[0]), 0.0, 1.0);
  float contrastedIntensity = uBrightness * pow(windowedIntensity, uContrast);
  return vec4(image.rgb, contrastedIntensity);
}

void main() {
  #ifdef VOLUMETRIC_IMAGE
    vec3 uv;
    #ifdef TRANSVERSE
      uv = vec3(vUv.x, vUv.y, (uActiveSlices.z + 0.5) / uVoxelCount.z);
    #endif // TRANSVERSE
    #ifdef SAGITTAL
      uv = vec3((uActiveSlices.x + 0.5) / uVoxelCount.x, vUv.x, vUv.y);
    #endif // SAGITTAL
    #ifdef CORONAL
      uv = vec3(vUv.x, (uActiveSlices.y + 0.5) / uVoxelCount.y, vUv.y);
    #endif // CORONAL
  #else // VOLUMETRIC_IMAGE
    vec2 uv = vUv;
  #endif // VOLUMETRIC_IMAGE

  vec4 toolPreview = texture(uToolPreview, vUv);
  
  vec4 imageValue = vec4(0.0);
  {{reduceEnhancedLayerStack(imageValue, uv, toolPreview, applyEnhancements)}}

  #ifdef BACKGROUND_BLEND
    imageValue.rgb = mix(uBackgroundColor, imageValue.rgb, imageValue.a);
    imageValue.a = 1.0;
  #endif

  pc_FragColor = imageValue;
}
