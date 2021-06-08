/**
 * Taken from https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
 */
float sdCone(vec3 p, float angle) {
    vec2 c = vec2(sin(angle), cos(angle));
    vec2 q = vec2( length(p.xz), -p.y );
    float d = length(q-c*max(dot(q,c), 0.0));
    return d * ((q.x*c.y-q.y*c.x<0.0)?-1.0:1.0);
}

vec3 transformToCutawaySpace(vec3 volumeCoords) {
  // TODO: Why does y have to be flipped?
  vec3 normalizedConeDirecion = normalize(vec3(uConeDirection.x, -uConeDirection.y, uConeDirection.z));
  vec3 normalizedConeAxis = vec3(0.0, 1.0, 0.0);

  /**
  * Taken from https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724
  */
  vec3 axis = cross( normalizedConeDirecion, normalizedConeAxis );

  float cosA = dot( normalizedConeDirecion, normalizedConeAxis );
  float k = 1.0 / (1.0 + cosA);

  mat3 rotation = mat3( 
    (axis.x * axis.x * k) + cosA,
    (axis.y * axis.x * k) - axis.z, 
    (axis.z * axis.x * k) + axis.y,
    (axis.x * axis.y * k) + axis.z,  
    (axis.y * axis.y * k) + cosA,      
    (axis.z * axis.y * k) - axis.x,
    (axis.x * axis.z * k) - axis.y,  
    (axis.y * axis.z * k) + axis.x,  
    (axis.z * axis.z * k) + cosA 
  );

  // The cutaway origin should be at the center of the volume.
  // Thus, we subtract vec3(0.5).
  return rotation * (volumeCoords - vec3(0.5));
}

/** The transfer function. */
vec4 transferFunction(VolumeData data, vec3 volumeCoords) {
  // F+C Edges
  if (uTransferFunction == 1) {
    vec4 edgeColor = vec4(vec3(1.0), mix(0.0, 0.015, step(uLimitLow, length(data.firstDerivative)) * (1.0 - step(uLimitHigh, length(data.firstDerivative)))) * uContextOpacity);
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
