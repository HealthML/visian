/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform sampler2D uVolume;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

vec4 getImageValue(vec3 volumeCoords) {
  vec2 sliceSize = vec2(1.0) / vec2(uAtlasGrid.x, uAtlasGrid.y);
  vec2 delta = vec2(
    mod(floor(volumeCoords.z * uVoxelCount.z), uAtlasGrid.x), 
    floor(volumeCoords.z * uVoxelCount.z / uAtlasGrid.x)
  );
  vec2 uvDelta = sliceSize * delta;
  // TODO: Do we need `fract` here?
  vec2 uv = volumeCoords.xy / uAtlasGrid + uvDelta;
  return texture2D(uVolume, uv);
}

/**
 * Computes the intersection between a ray and the unit box
 * centered on (0, 0, 0).
 *
 * Closest intersecton distance is return in `near`, and
 * furthest intersection is returned in `far`.
 *
 * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
 */
void computeNearFar(vec3 normalizedRayDirection, inout float near, inout float far) {
  // Ray is assumed to be in local coordinates, ie:
  // ray = inverse(objectMatrix * invCameraMatrix) * ray
  // Equation of ray: O + D * t
  vec3 invRay = vec3(1.0) / normalizedRayDirection;

  // Shortcut here, it should be: `aabbMin - vRayOrigin`.
  // As we are always using normalized AABB, we can skip the line
  // `(0, 0, 0) - vRayOrigin`.
  vec3 tbottom = - invRay * vRayOrigin;
  vec3 ttop = invRay * (vec3(1.0) - vRayOrigin);

  vec3 tmin = min(ttop, tbottom);
  vec3 tmax = max(ttop, tbottom);

  float largestMin = max(max(tmin.x, tmin.y), max(tmin.x, tmin.z));
  float smallestMax = min(min(tmax.x, tmax.y), min(tmax.x, tmax.z));

  near = largestMin;
  far = smallestMax;
}

void main() {

  vec3 normalizedRayDirection = normalize(vRayDirection);

  // Solves a ray - Unit Box equation to determine the value of the closest and
  // furthest intersections.
  float near = 0.0;
  float far = 0.0;
  computeNearFar(normalizedRayDirection, near, far);

  // Moves the ray origin to the closest intersection.
  // We don't want to spend time sampling nothing out of the volume!
  vec3 rayOrigin = vRayOrigin + near * normalizedRayDirection;

  gl_FragColor = vec4(getImageValue(rayOrigin));
}
