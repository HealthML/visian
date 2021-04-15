#ifndef MAX_STEPS
  #define MAX_STEPS 500
#endif

/**
 * Marches a ray from @param origin poiting in the provided @param direction.
 * 
 * Needs a global function getVolumeColor which returns a color
 * at given coordinates and a definition for MAX_STEPS.
 *
 * Returns a vec4 containing the accumulated color.
 */
vec4 marchRay(vec3 origin, vec3 direction, float near, float far, float stepSize) {
  // Entry aligned sampling.
  float dist = near + stepSize / 2.0;
  vec3 samplePosition = origin + dist * direction;
  vec3 scaledDirection = direction * stepSize;

  vec4 acc = vec4(0.0);

  vec4 currentVoxel;
  for (int i = 0; i < MAX_STEPS; ++i) {
    currentVoxel = getVolumeColor(samplePosition);

    acc.rgb += (1.0 - acc.a) * currentVoxel.rgb * currentVoxel.a;
    acc.a += (1.0 - acc.a) * currentVoxel.a;

    samplePosition += scaledDirection;
    dist += stepSize;

    if (dist > far) {
      break;
    }
  }

  return acc;
}