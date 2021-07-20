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
    // TODO: Add correct color and opacity
    vec4 edgeColor = vec4(data.imageColor.rgb, data.imageColor.a * mix(0.0, 0.015, step(uLimitLow, length(data.firstDerivative)) * (1.0 - step(uLimitHigh, length(data.firstDerivative)))));
    return uUseFocus ?
        mix(edgeColor, data.annotation, step(0.1, data.annotation.a))
      : edgeColor;
  }

  // F+C Cutaway
  if (uTransferFunction == 2) {
    float cone = sdCone(transformToCutawaySpace(volumeCoords), uConeAngle);
    float contextFactor = step(0.0, cone);
    float filteredDensity = data.image.a * step(0.05, data.image.a);

    vec4 contextColor = vec4(filteredDensity) * contextFactor;
    return uUseFocus ?
        mix(contextColor, data.annotation, step(0.1, data.annotation.a))
      : contextColor;
  }

  // Custom
  if (uTransferFunction == 3) {
    return texture2D(uCustomTFTexture, vec2(data.image.a, 0));
  }

  // Density
  vec4 densityColor = data.image * vec4(step(uLimitLow, data.imageRaw.a) * (1.0 - step(uLimitHigh, data.imageRaw.a)));
  return uUseFocus ?
      densityColor * data.annotation.a
    : densityColor;
}

vec4 transferFunction(VolumeData data, vec3 volumeCoords) {
  vec4 baseTransferedColor = baseTransferFunction(data, volumeCoords);
  if(!uUsePlane) return baseTransferedColor;

  float planeFactor = step(0.0, sdPlane(volumeCoords - vec3(0.5), uPlaneNormal, uPlaneDistance));
  return baseTransferedColor * planeFactor;
}
