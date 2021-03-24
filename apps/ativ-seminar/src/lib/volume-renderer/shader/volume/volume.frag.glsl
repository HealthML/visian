/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform vec3 uCameraPosition;
uniform sampler2D uVolume;
uniform sampler2D uInputFirstDerivative;
uniform sampler2D uInputSecondDerivative;
uniform sampler2D uOutputFirstDerivative;
uniform sampler2D uFocus;
uniform bool uUseFocus;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;
uniform float uStepSize;

// User-defined transfer function options
uniform float uOpacity;
uniform int uTransferFunction;
uniform float uConeAngle;

@import ../utils/volume-data;
@import ../gradient/decode-gradient;
@import ./transfer-functions;

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
  data.firstDerivative = decodeGradient(texture2D(uInputFirstDerivative, uv));
  data.secondDerivative = decodeGradient(texture2D(uInputSecondDerivative, uv));

  // Here we don't normalize yet, because we need to interpolate before normalizing.
  data.normal = decodeGradient(texture2D(uOutputFirstDerivative, uv));
  
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

  // Here we normalize after interpolating.
  interpolatedData.normal = normalize(mix(lowerData.normal, upperData.normal, interpolation));

  // The focus texture should not be interpolated.
  interpolatedData.focus = mix(lowerData.focus, upperData.focus, step(0.5, interpolation));

  return interpolatedData;
}

// TODO: These should be uniforms.
float ambient = 0.6;
vec3 lightPosition = vec3(2.0); // In volume coordinates.
float intensity = 1.0;
float shinyness = 15.0;

vec4 phong(vec4 volumeColor, VolumeData volumeData, vec3 volumeCoords) {
  vec3 specularColor = vec3(0.8) + 0.2 * volumeColor.rgb;
  // vec3 specularColor = vec3(1.0, 0.0, 0.0);
  
  // TODO: Rethink this. Probably has to depend on the transfer function...
  // vec3 normal = normalize(-volumeData.firstDerivative);
  vec3 normal = volumeData.normal;

  vec3 lightDirection = normalize(lightPosition - volumeCoords);
  vec3 reflectionDirection = reflect(-lightDirection, normal);
  vec3 viewDirection = normalize(uCameraPosition - volumeCoords);

  float diffuse = max(0.0, dot(lightDirection, normal));
  float specular = pow(max(dot(reflectionDirection, viewDirection), 0.0), shinyness);

  return vec4((ambient + intensity * diffuse) * volumeColor.rgb + specularColor * specular, volumeColor.a);
}

vec4 getVolumeColor(vec3 volumeCoords) {
  VolumeData volumeData = getInterpolatedVolumeData(volumeCoords);
  vec4 volumeColor = transferFunction(volumeData, volumeCoords);
  // return vec4(volumeColor.rgb, volumeColor.a * uOpacity);
  vec4 phongColor = phong(volumeColor, volumeData, volumeCoords);
  return vec4(phongColor.rgb, phongColor.a * uOpacity);
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

@import ../utils/march-ray;

/**
 * @see https://davidpeicho.github.io/blog/cloud-raymarching-walkthrough-part1/
 */
void main() {
  vec3 normalizedRayDirection = normalize(vRayDirection);

  float near;
  float far;
  computeNearFar(normalizedRayDirection, near, far);

  gl_FragColor = marchRay(vRayOrigin, normalizedRayDirection, near, far, uStepSize);
}
