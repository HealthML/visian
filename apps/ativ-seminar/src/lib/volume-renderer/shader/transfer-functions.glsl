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
  vec3 normalizedCamera = normalize(vec3(uCameraPosition.x, -uCameraPosition.y, uCameraPosition.z));
  vec3 normalizedConeAxis = vec3(0.0, 1.0, 0.0);

  /**
  * Taken from https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724
  */
  vec3 axis = cross( normalizedCamera, normalizedConeAxis );

  float cosA = dot( normalizedCamera, normalizedConeAxis );
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
  // return vec4(data.firstDerivative * 3.0, data.density);

  // return vec4(vec3(0.7 * data.density), mix(0.0, 0.02, step(0.1, length(data.firstDerivative))));
  // return vec4(data.firstDerivative * 3.0, mix(0.0, 0.015, step(0.1, length(data.firstDerivative))));
  // return vec4(vec3(0.5), mix(0.0, 0.015, step(0.12, length(data.firstDerivative))));

  if (uTransferFunction == 1) {
    // return mix(vec4(data.firstDerivative * 5.0, mix(0.0, 0.015, step(0.1, length(data.firstDerivative))) * 0.2), vec4(vec3(1.0), 0.8), data.focus);
    return uUseFocus ?
        vec4(vec3(1), mix(mix(0.0, 0.015, step(0.1, length(data.firstDerivative))) * 0.2, 0.8, data.focus))
      : vec4(vec3(1), mix(0.0, 0.015, step(0.1, length(data.firstDerivative))) * 0.8);

    // return mix(vec4(vec3(0.5), mix(0.0, 0.015, step(0.12, length(data.firstDerivative)))), vec4(1.0, 0.0, 0.0, 1.0), data.focus);
  }

  if (uTransferFunction == 2) {
    // TODO: Extract the angle into a uniform.
    float cone = sdCone(transformToCutawaySpace(volumeCoords), uConeAngle);
    float contextFactor = step(0.0, cone);
    float filteredDensity = data.density * step(0.05, data.density);
    return mix(vec4(filteredDensity) * contextFactor, vec4(1.0, 0.0, 0.0, 1.0), step(0.1, data.focus));
  }

  return uUseFocus ?
        vec4(data.density * data.focus)
      : vec4(data.density);

  // return vec4(data.density * step(0.05, data.density));
  // return mix(vec4(0.0), vec4(1.0, 0.0, 0.0, 1.0), step(0.1, data.focus));
}
