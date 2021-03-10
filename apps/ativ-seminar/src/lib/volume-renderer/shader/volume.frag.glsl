/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform sampler2D uVolume;
uniform sampler2D uFirstDerivative;
uniform sampler2D uSecondDerivative;
uniform sampler2D uFocus;
uniform bool uUseFocus;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;
uniform float uStepSize;

struct VolumeData {
  float density;
  vec3 firstDerivative;
  vec3 secondDerivative;
  float focus;
};

// TODO: Choose this non-arbitrarily
const int MAX_STEPS = 600;

vec3 decodeGradient(vec4 encodedGradient) {
  vec3 signs;
  signs.x = mix(-1.0, 1.0, step(0.5, encodedGradient.a));
  signs.y = mix(-1.0, 1.0, step(0.25, mod(encodedGradient.a, 0.5)));
  signs.z = mix(-1.0, 1.0, step(0.125, mod(mod(encodedGradient.a, 0.5), 0.25)));

  return encodedGradient.xyz * signs;
}

/**
 * Returns the volume data on one slice at the given volume coordinates.
 *
 * @param volumeCoords The volume coordinates (ranged [0, 1]).
 */
VolumeData getVolumeData(vec3 volumeCoords) {
  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  float zSlice = floor(volumeCoords.z * uVoxelCount.z);
  vec2 sliceOffset = vec2(
    mod(zSlice, uAtlasGrid.x), 
    floor(zSlice / uAtlasGrid.x)
  );

  // TODO: Why does this case even happpen?
  if (sliceOffset.x == uAtlasGrid.x) {
    sliceOffset.x = 0.0;
    sliceOffset.y += 1.0;
  }

  vec2 uvOffset = sliceSize * sliceOffset;
  vec2 uv = (volumeCoords.xy / uAtlasGrid + uvOffset);

  VolumeData data;
  data.density = texture2D(uVolume, uv).r;
  data.firstDerivative = decodeGradient(texture2D(uFirstDerivative, uv));
  data.secondDerivative = decodeGradient(texture2D(uSecondDerivative, uv));
  data.focus = texture2D(uFocus, uv).r;

  return data;
}

/**
 * Returns the z-interpolated volume data at the given volume coordinates.
 *
 * @param volumeCoords The volume coordinates (ranged [0, 1]).
 */
VolumeData getInterpolatedVolumeData(vec3 volumeCoords) {
  float voxelZ = volumeCoords.z * uVoxelCount.z;
  float interpolation = fract(voxelZ);

  float z0 = floor(voxelZ) / uVoxelCount.z;
  float z1 = ceil(voxelZ) / uVoxelCount.z;

  vec3 lowerVoxel = vec3(volumeCoords.xy, z0);
  vec3 upperVoxel = vec3(volumeCoords.xy, z1);

  VolumeData lowerData = getVolumeData(lowerVoxel);
  VolumeData upperData = getVolumeData(upperVoxel);

  VolumeData interpolatedData;
  interpolatedData.density = mix(lowerData.density, upperData.density, interpolation);
  interpolatedData.firstDerivative = mix(lowerData.firstDerivative, upperData.firstDerivative, interpolation);
  interpolatedData.secondDerivative = mix(lowerData.secondDerivative, upperData.secondDerivative, interpolation);

  // The focus texture should not be interpolated.
  interpolatedData.focus = mix(lowerData.focus, upperData.focus, step(0.5, interpolation));

  return interpolatedData;
}

/** The transfer function. */
vec4 transferFunction(VolumeData data) {
  // return vec4(data.firstDerivative * 3.0, data.density);

  // return vec4(vec3(0.7 * data.density), mix(0.0, 0.02, step(0.1, length(data.firstDerivative))));
  // return vec4(data.firstDerivative * 3.0, mix(0.0, 0.015, step(0.1, length(data.firstDerivative))));
  // return vec4(vec3(0.5), mix(0.0, 0.015, step(0.12, length(data.firstDerivative))));


  // return mix(vec4(data.firstDerivative * 5.0, mix(0.0, 0.015, step(0.1, length(data.firstDerivative))) * 0.2), vec4(vec3(1.0), 0.8), data.focus);
  // return !uUseFocus ?
  //     vec4(vec3(0.5), mix(0.0, 0.015, step(0.1, length(data.firstDerivative))))
  //   : vec4(vec3(1), mix(mix(0.0, 0.015, step(0.1, length(data.firstDerivative))) * 0.2, 0.02, data.focus));

  return mix(vec4(vec3(0.5), mix(0.0, 0.015, step(0.12, length(data.firstDerivative)))), vec4(1.0, 0.0, 0.0, 1.0), data.focus);
}

vec4 getVolumeColor(vec3 volumeCoords) {
  return transferFunction(getInterpolatedVolumeData(volumeCoords));
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
  if (
    vRayOrigin.x < 1.0 && vRayOrigin.y < 1.0 && vRayOrigin.z < 1.0 && 
    vRayOrigin.x > 0.0 && vRayOrigin.y > 0.0 && vRayOrigin.z > 0.0
  ) {
    // The ray starts within the volume.
    near = 0.05;
    far = distance(vRayOrigin, vPosition);
    return;
  }

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
  float near;
  float far;
  computeNearFar(normalizedRayDirection, near, far);

  // Entry aligned sampling.
  float dist = near + uStepSize / 2.0;
  vec3 rayOrigin = vRayOrigin + dist * normalizedRayDirection;
  vec3 scaledRayDirection = normalizedRayDirection * uStepSize;

  // Accumulation through the volume is stored in this variable.
  vec4 acc = vec4(0.0);

  for (int i = 0; i < MAX_STEPS; ++i) {
    // Get the voxel at the current ray position.
    vec4 currentVoxel = getVolumeColor(rayOrigin);
    // s = mix(0.0, s / 20.0, step(5.0, s));

    // The more we already accumulated, the less color we apply.
    acc.rgb += (1.0 - acc.a) * currentVoxel.rgb * currentVoxel.a;
    // The more we already accumulated, the less opacity we apply.
    acc.a += (1.0 - acc.a) * currentVoxel.a;

    // Early termination: after this threshold, accumulating becomes insignificant.
    if (acc.a > 0.95) {
      break;
    }

    rayOrigin += scaledRayDirection;
    dist += uStepSize;

    if (dist > far) {
      break;
    }
  }

  gl_FragColor = acc;
}
