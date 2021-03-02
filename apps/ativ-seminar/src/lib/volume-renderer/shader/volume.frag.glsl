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
  vec2 sliceSize = vec2(1.0) / vec2(uAtlasGrid.x, uAtlasGrid.y);
  vec2 delta = vec2(
    mod(floor(volumeCoords.z * uVoxelCount.z), uAtlasGrid.x), 
    floor(volumeCoords.z * uVoxelCount.z / uAtlasGrid.x)
  );
  vec2 uvDelta = sliceSize * delta;
  // TODO: Why do we need the `fract` here to correct for empty slices?
  vec2 uv = fract(volumeCoords.xy / uAtlasGrid + uvDelta);
  return texture2D(uVolume, uv);
}

vec3 getVolumeCoords(vec3 voxelCoords) {
  vec3 clampedVoxel = max(vec3(0.0), min(uVoxelCount - vec3(1.0), voxelCoords));
  vec3 centeredVoxel = clampedVoxel + vec3(0.5);
  return centeredVoxel / uVoxelCount;
}

vec4 getInterpolatedImageValue(vec3 volumeCoords) {
  vec3 voxelCoords = uVoxelCount * volumeCoords;
  vec3 minVoxel = floor(voxelCoords);
  vec3 maxVoxel = ceil(voxelCoords);
  vec3 interpolationValues = fract(voxelCoords);

  // min slice
  vec3 minX = getVolumeCoords(vec3(maxVoxel.x, minVoxel.yz));
  vec3 minY = getVolumeCoords(vec3(minVoxel.x, maxVoxel.y, minVoxel.z));
  vec3 minXY = getVolumeCoords(vec3(maxVoxel.xy, minVoxel.z));

  // max slice
  vec3 maxX = getVolumeCoords(vec3(minVoxel.x, maxVoxel.yz));
  vec3 maxY = getVolumeCoords(vec3(maxVoxel.x, minVoxel.y, maxVoxel.z));
  vec3 maxXY = getVolumeCoords(vec3(minVoxel.xy, maxVoxel.z));

  minVoxel = getVolumeCoords(minVoxel);
  maxVoxel = getVolumeCoords(maxVoxel);

  vec4 minXMix0 = mix(getImageValue(minVoxel), getImageValue(minX), interpolationValues.x);
  vec4 minXMix1 = mix(getImageValue(minY), getImageValue(minXY), interpolationValues.x);
  vec4 minMix = mix(minXMix0, minXMix1, interpolationValues.y);

  vec4 maxXMix0 = mix(getImageValue(maxVoxel), getImageValue(maxX), 1.0 - interpolationValues.x);
  vec4 maxXMix1 = mix(getImageValue(maxY), getImageValue(maxXY), 1.0 - interpolationValues.x);
  vec4 maxMix = mix(maxXMix0, maxXMix1, 1.0 - interpolationValues.y);

  return mix(minMix, maxMix, interpolationValues.z);
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

    if (
      min(rayOrigin.x, min(rayOrigin.y, rayOrigin.z)) < 0.0 || 
      max(rayOrigin.x, max(rayOrigin.y, rayOrigin.z)) > 1.0
    ) {
      break;
    }
  }

  gl_FragColor = vec4(acc);
}
