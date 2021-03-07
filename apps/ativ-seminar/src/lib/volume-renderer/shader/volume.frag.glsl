/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform sampler2D uVolume;
uniform sampler2D uFirstDerivative;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;
uniform float uStepSize;

// TODO: Choose this non-arbitrarily
const int MAX_STEPS = 400;

/**
 * Returns the texture value at the given volume coordinates.
 *
 * @param sourceTexture The texture to read from.
 * @param volumeCoords The volume coordinates (ranged [0, 1]).
 */
vec4 getTextureValue(sampler2D sourceTexture, vec3 volumeCoords) {
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
  return texture2D(sourceTexture, uv);
}

/**
 * Returns the z-interpolated texture value at the given volume coordinates.
 *
 * @param sourceTexture The texture to read from.
 * @param volumeCoords The volume coordinates (ranged [0, 1]).
 */
vec4 getInterpolatedTextureValue(sampler2D sourceTexture, vec3 volumeCoords) {
  float voxelZ = volumeCoords.z * uVoxelCount.z;
  float interpolation = fract(voxelZ);

  float z0 = floor(voxelZ) / uVoxelCount.z;
  float z1 = ceil(voxelZ) / uVoxelCount.z;

  vec3 lowerVoxel = vec3(volumeCoords.xy, z0);
  vec3 upperVoxel = vec3(volumeCoords.xy, z1);

  vec4 lowerValue = getTextureValue(sourceTexture, lowerVoxel);
  vec4 upperValue = getTextureValue(sourceTexture, upperVoxel);

  return mix(lowerValue, upperValue, interpolation);
}

/** The transfer function. */
vec4 transferFunction(vec3 volumeCoords) {
  vec3 firstDerivative = getInterpolatedTextureValue(uFirstDerivative, volumeCoords).xyz;
  float density = getInterpolatedTextureValue(uVolume, volumeCoords).r;

  // return vec4(vec3(0.5 * density), mix(0.0, 0.02, step(0.5, length(firstDerivative))));
  return vec4(vec3(0.5), mix(0.0, 0.015, step(0.6, length(firstDerivative))));
  
  // return vec4(firstDerivative, density);

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
  float near = 0.0;
  float far = 0.0;
  computeNearFar(normalizedRayDirection, near, far);

  // Entry aligned sampling.
  float dist = near + uStepSize / 2.0;
  vec3 rayOrigin = vRayOrigin + dist * normalizedRayDirection;
  vec3 scaledRayDirection = normalizedRayDirection * uStepSize;

  // Accumulation through the volume is stored in this variable.
  vec4 acc = vec4(0.0);

  for (int i = 0; i < MAX_STEPS; ++i) {
    // Get the voxel at the current ray position.
    vec4 currentVoxel = transferFunction(rayOrigin);
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
