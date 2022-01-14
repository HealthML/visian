/**
 * Returns the volume data on one slice at the given volume coordinates.
 *
 * @param volumeCoords The volume coordinates (ranged [0, 1]).
 */
VolumeData getVolumeData(vec3 uv) {
  VolumeData data;

  #ifdef NO_WRAPPING
    if(max(max(uv.x, uv.y), uv.z) > 1.0 || min(min(uv.x, uv.y), uv.z) < 0.0) {
      return data;
    }
  #endif

  vec4 imageValue = vec4(0.0);
  vec4 imageRaw = vec4(0.0);
  {{reduceLayerStack(imageValue, uv, false, imageRaw)}}

  data.image = imageValue;
  data.imageRaw = imageRaw;
  data.firstDerivative = decodeVec3(texture2D(uInputFirstDerivative, uv));
  // data.secondDerivative = decodeVec3(texture2D(uInputSecondDerivative, uv));

  #ifdef NORMAL
    if(uLightingMode == 1) {
      data.normal = normalize(decodeVec3(texture(uOutputFirstDerivative, uv)));
    }
  #endif // NORMAL

  #ifdef LAO
    if(uLightingMode == 2) {
      data.lao = texture2D(uLAO, uv).x;
    }
  #endif // LAO
  
  if(uUseFocus) {
    vec4 focusValue = vec4(0.0);
    {{reduceLayerStack(focusValue, uv, true)}}
    data.annotation = focusValue;
  }

  return data;
}
