varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform vec3 uActiveSlices;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

#ifdef IMAGE
  uniform vec3 uForegroundColor;
  uniform float uContrast;
  uniform float uBrightness;
  uniform int uComponents;
#endif // IMAGE

#ifdef ANNOTATION
  uniform vec3 uAnnotationColor;
  uniform float uAnnotationOpacity;
#endif // ANNOTATION

void main() {
  vec3 volumeCoords;
  #ifdef TRANSVERSE
    volumeCoords = vec3(1.0 - vUv.x, vUv.y, (uActiveSlices.z + 0.5) / uVoxelCount.z);
  #endif // TRANSVERSE
  #ifdef SAGITTAL
    volumeCoords = vec3((uActiveSlices.x + 0.5) / uVoxelCount.x, 1.0 - vUv.x, vUv.y);
  #endif // SAGITTAL
  #ifdef CORONAL
    volumeCoords = vec3(1.0 - vUv.x, (uActiveSlices.y + 0.5) / uVoxelCount.y, vUv.y);
  #endif // CORONAL

  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  vec2 delta = vec2(
    mod(floor(volumeCoords.z * uVoxelCount.z), uAtlasGrid.x), 
    floor(volumeCoords.z * uVoxelCount.z / uAtlasGrid.x)
  );
  vec2 uvDelta = sliceSize * delta;
  vec2 uv = fract(volumeCoords.xy / uAtlasGrid + uvDelta)  ;
  vec4 texelValue = texture2D(uDataTexture, uv);

  #ifdef IMAGE
    // TODO: How do we display two components?

    // TODO: Brightness and contrast adjustments for 3/4 components.
    if(uComponents == 3) {
      gl_FragColor = vec4(texelValue.rgb, 1.0);
      return;
    }
    if(uComponents == 4) {
      gl_FragColor = texelValue;
      return;
    }

    float contrastedColor = uBrightness * pow(texelValue.x, uContrast);

    gl_FragColor = vec4(uForegroundColor, contrastedColor);
  #endif // IMAGE
  
  #ifdef ANNOTATION
    float annotation = step(0.01, texelValue.x);
    gl_FragColor = vec4(uAnnotationColor, mix(0.0, uAnnotationOpacity, annotation));
  #endif // ANNOTATION
}