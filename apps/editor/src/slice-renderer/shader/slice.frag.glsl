varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform vec3 uActiveSlices;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

#ifdef SCAN
  uniform float uScanBackground;
  uniform float uContrast;
  uniform float uBrightness;
  uniform bool uBlueTint;
#endif // SCAN

#ifdef ANNOTATION
  uniform vec3 uWIPColor;
  uniform vec3 uGTColor;
  uniform vec3 uGoodMachineColor;
  uniform vec3 uBadMachineColor;
  uniform float uAnnotationOpacity;
  uniform sampler2D uGroundTruthTexture;
  uniform int uGTDirection;

  // The mode in which the annotation is rendered:
  // 0: Both annotations are rendered (user annotation beats machine annotation if user scope is set)
  // 1: Only the user annotation is rendered
  // 2: Only the machine annotation is rendered
  // 3: No annotation is rendered
  uniform int uAnnotationMode;
#endif // ANNOTATION

void main() {
  #ifdef ANNOTATION
    if(uAnnotationMode >= 3)
      discard;
  #endif // ANNOTATION

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

  #ifdef SCAN
    if(texelValue.x <= uScanBackground)
      discard;
    
    float contrastedColor = uBrightness * pow(texelValue.x, uContrast);

    vec3 tintedColor = mix(vec3(0.0, 0.0, uBlueTint ? 0.06 : 0.0), vec3(1.0), contrastedColor);

    gl_FragColor = vec4(tintedColor, 1.0);
  #endif // SCAN
  
  #ifdef ANNOTATION
    float annotation = floor(texelValue.r * 255.0 + 0.5); // round() is not supported

    float userAnnotation = step(128.0, annotation);
    float userScope = step(64.0, mod(annotation, 128.0));
    float machineAnnotation = step(1.0, mod(annotation, 64.0));
    float machineCertainty = (mod(annotation, 64.0) - 1.0) / 62.0;
    
    vec2 groundTruthUV = vec2(volumeCoords.z, 0.5);
    if(uGTDirection == 1) {
      groundTruthUV.x = volumeCoords.x;
    }
    if(uGTDirection == 2) {
      groundTruthUV.x = volumeCoords.y;
    }
    float groundTruth = texture2D(uGroundTruthTexture, groundTruthUV).r;

    vec3 userColor = mix(uWIPColor, uGTColor, groundTruth);
    vec3 machineColor = mix(uBadMachineColor, uGoodMachineColor, machineCertainty);

    if(uAnnotationMode == 0) {
      // user annotation beats machine annotation if user scope is set
      if(userScope < 1.0 && machineAnnotation < 1.0)
        discard;

      if((userScope > 0.0 || groundTruth > 0.0) && userAnnotation < 1.0)
        discard;

      gl_FragColor = vec4(mix(machineColor, userColor, userScope), uAnnotationOpacity);
      return;
    }

    if(uAnnotationMode == 1) {
      // only user annotation
      if(userAnnotation < 1.0)
        discard;

      gl_FragColor = vec4(userColor, uAnnotationOpacity);
      return;
    }

    if(uAnnotationMode == 2) {
      // only machine annotation
      if(machineAnnotation < 1.0)
        discard;

      gl_FragColor = vec4(machineColor, uAnnotationOpacity);
      return;
    }

  #endif // ANNOTATION
}