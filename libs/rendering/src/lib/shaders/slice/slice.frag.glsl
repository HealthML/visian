varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform vec3 uActiveSlices;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

#ifdef IMAGE
  uniform vec3 uForegroundColor;
  uniform float uContrast;
  uniform float uBrightness;
  uniform float uImageOpacity;
  uniform int uComponents;
#endif // IMAGE

#ifdef ANNOTATION
  uniform vec3 uAnnotationColor;
  uniform float uAnnotationOpacity;

  uniform bool uUseMergeTexture;
  uniform sampler2D uMergeTexture;
  uniform float uMergeThreshold;
#endif // ANNOTATION

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
  
  vec4 texelValue = texture2D(uDataTexture, uv);

  #ifdef IMAGE
    // TODO: How do we display two components?

    if(uComponents == 3) {
      gl_FragColor = vec4(
        uBrightness * pow(texelValue.rgb, vec3(uContrast)),
        uImageOpacity
      );
      return;
    }
    if(uComponents == 4) {
      gl_FragColor = vec4(
        uBrightness * pow(texelValue.rgb, vec3(uContrast)),
        mix(0.0, uImageOpacity, texelValue.a)
      );
      return;
    }

    float contrastedColor = uBrightness * pow(texelValue.x, uContrast);
    gl_FragColor = vec4(uForegroundColor, mix(0.0, uImageOpacity, contrastedColor));
  #endif // IMAGE
  
  #ifdef ANNOTATION
    float annotation = step(0.01, texelValue.x);

    if(uUseMergeTexture) {
      float mergeValue = texture2D(uMergeTexture, uv).x;
      float merge = step(uMergeThreshold, mergeValue);

      gl_FragColor = vec4(uAnnotationColor, mix(0.0, uAnnotationOpacity / mix(1.0, 2.0, merge * (1.0 - annotation)), mix(annotation, 1.0, merge)));
    } else {
      gl_FragColor = vec4(uAnnotationColor, mix(0.0, uAnnotationOpacity, annotation));
    }

  #endif // ANNOTATION
}
