/**
 * Taken from https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
 */
float sdCone(vec3 p, float angle) {
    vec2 c = vec2(sin(angle), cos(angle));
    vec2 q = vec2( length(p.xz), -p.y );
    float d = length(q-c*max(dot(q,c), 0.0));
    return d * ((q.x*c.y-q.y*c.x<0.0)?-1.0:1.0);
}

/**
 * Taken from https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
 */
float sdPlane(vec3 p, vec3 n, float h) {
  return dot(p, n) + h;
}

vec3 transformToCutawaySpace(vec3 volumeCoords) {
  // The cutaway origin should be at the center of the volume.
  // Thus, we subtract vec3(0.5).
  return uConeMatrix * (volumeCoords - vec3(0.5));
}

/** The transfer function. */
vec4 baseTransferFunction(VolumeData data, vec3 volumeCoords) {
  // F+C Edges
  if (uTransferFunction == 1) {
    vec4 edgeColor = vec4(uContextColor, mix(0.0, 0.015, step(uLimitLow, length(data.firstDerivative)) * (1.0 - step(uLimitHigh, length(data.firstDerivative)))) * uContextOpacity);
    vec4 focusColor = vec4(uFocusColor, uFocusOpacity);
    return uUseFocus ?
        mix(edgeColor, focusColor, step(0.1, data.focus))
      : edgeColor;
  }

  // F+C Cutaway
  if (uTransferFunction == 2) {
    float cone = sdCone(transformToCutawaySpace(volumeCoords), uConeAngle);
    float contextFactor = step(0.0, cone);
    float filteredDensity = data.density * step(0.05, data.density);

    vec4 contextColor = vec4(vec3(filteredDensity), filteredDensity * uContextOpacity) * contextFactor;
    vec4 focusColor = vec4(uFocusColor, uFocusOpacity);
    return uUseFocus ?
        mix(contextColor,focusColor, step(0.1, data.focus))
      : contextColor;
  }

  // Custom
  if (uTransferFunction == 3) {
    return texture2D(uCustomTFTexture, vec2(data.density, 0));
  }

  // Density
  vec4 densityColor = vec4(((data.density - uLimitLow) / (uLimitHigh - uLimitLow)) * step(uLimitLow, data.density) * (1.0 - step(uLimitHigh, data.density)));
  return uUseFocus ?
      densityColor * data.focus
    : densityColor;
}

vec4 transferFunction(VolumeData data, vec3 volumeCoords) {
  vec4 baseTransferedColor = baseTransferFunction(data, volumeCoords);
  if(!uUsePlane) return baseTransferedColor;

  float planeFactor = step(0.0, sdPlane(volumeCoords - vec3(0.5), uPlaneNormal, uPlaneDistance));
  return baseTransferedColor * planeFactor;
}
