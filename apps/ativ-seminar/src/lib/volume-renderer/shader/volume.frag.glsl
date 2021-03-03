/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform sampler2D uVolume;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

// TODO: Choose this non-arbitrarily
const int MAX_STEPS = 200;

vec4 getImageValue(vec3 volumeCoords) {
  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  float zSlice = floor(volumeCoords.z * uVoxelCount.z);
  vec2 sliceDelta = vec2(
    mod(zSlice, uAtlasGrid.x), 
    floor(zSlice / uAtlasGrid.x)
  );

  // TODO: Why does this case even happpen?
  if(sliceDelta.x == uAtlasGrid.x) {
    sliceDelta.x = 0.0;
    sliceDelta.y += 1.0;
  } 

  vec2 uvDelta = sliceSize * sliceDelta;
  vec2 uv = (volumeCoords.xy / uAtlasGrid + uvDelta);
  return texture2D(uVolume, uv);
}

vec4 getInterpolatedImageValue(vec3 volumeCoords) {
  float voxelZ = volumeCoords.z * uVoxelCount.z;
  float interpolation = fract(voxelZ);

  float z0 = floor(voxelZ) / uVoxelCount.z;
  float z1 = ceil(voxelZ) / uVoxelCount.z;

  vec3 lowerVoxel = vec3(volumeCoords.xy, z0);
  vec3 upperVoxel = vec3(volumeCoords.xy, z1);

  vec4 lowerValue = getImageValue(lowerVoxel);
  vec4 upperValue = getImageValue(upperVoxel);

  return mix(lowerValue, upperValue, interpolation);
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
  vec3 tbottom = -invRay * vRayOrigin;
  vec3 ttop = invRay * (vec3(1.0) - vRayOrigin);

  vec3 tmin = min(ttop, tbottom);
  vec3 tmax = max(ttop, tbottom);

  float largestMin = max(max(tmin.x, tmin.y), max(tmin.x, tmin.z));
  float smallestMax = min(min(tmax.x, tmax.y), min(tmax.x, tmax.z));

  near = largestMin;
  far = smallestMax;
}

/**
 * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
 */
void main() {
  vec3 normalizedRayDirection = normalize(vRayDirection);

  // Solves a ray - Unit Box equation to determine the value of the closest and
  // furthest intersections
  float near = 0.0;
  float far = 0.0;
  computeNearFar(normalizedRayDirection, near, far);

  float dist = near;

  // Moves the ray origin to the closest intersection.
  // We don't want to spend time sampling nothing out of the volume!
  vec3 rayOrigin = vRayOrigin + near * normalizedRayDirection;

  // TODO: Does it make sense to shade each voxel discretely?
  vec3 inc = 1.0 / abs(normalizedRayDirection);
  float delta = min(inc.x, min(inc.y, inc.z)) / float(MAX_STEPS);
  vec3 scaledRayDirection = normalizedRayDirection * delta;

  // Accumulation through the volume is stored in this variable.
  vec4 acc = vec4(0.0);

  for (int i = 0; i < MAX_STEPS; ++i) {
    // Get the voxel at the current ray position.
    float s = getInterpolatedImageValue(rayOrigin).r;

    // The more we already accumulated, the less color we apply.
    acc.rgb += (1.0 - acc.a) * s * s;
    // The more we already accumulated, the less opacity we apply.
    acc.a += (1.0 - acc.a) * s;

    // Early termination: after this threshold, accumulating becomes insignificant.
    if (acc.a > 0.95) {
      break;
    }

    rayOrigin += scaledRayDirection;
    dist += delta;

    if (dist > far) {
      break;
    }
  }

  gl_FragColor = acc;
}
