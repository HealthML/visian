varying vec2 vUv;

uniform sampler2D uTextureAtlas;
uniform vec3 uVoxelSpacing;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;
uniform float uInputDimensions;

/**
 * Returns the image value at the given volume coordinates.
 *
 * @param voxelCoords The voxel coordinates (ranged [0, uVoxelCount.*]).
 */
vec4 getImageValue(vec3 voxelCoords) {
  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  vec2 sliceOffset = vec2(
    mod(voxelCoords.z, uAtlasGrid.x), 
    floor(voxelCoords.z / uAtlasGrid.x)
  );

  // TODO: Why does this case even happpen?
  if(sliceOffset.x == uAtlasGrid.x) {
    sliceOffset.x = 0.0;
    sliceOffset.y += 1.0;
  }

  vec2 uvOffset = sliceSize * sliceOffset;
  vec2 uv = ((voxelCoords.xy + vec2(0.5)) / uVoxelCount.xy / uAtlasGrid + uvOffset);
  return texture2D(uTextureAtlas, uv);
}

void main() {
  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  vec2 sliceOffset = floor(vUv / sliceSize);
  float zSlice = uAtlasGrid.x * sliceOffset.y + sliceOffset.x;

  if (zSlice >= uVoxelCount.z) {
    gl_FragColor = vec4(vec3(0.0), 1.0);
    return;
  }

  vec2 offsetInSlice = fract(vUv / sliceSize);

  vec3 voxelCoords = vec3(offsetInSlice * uVoxelCount.xy, zSlice);

  vec4 upX = getImageValue(vec3(min(uVoxelCount.x - 1.0, voxelCoords.x + 1.0), voxelCoords.yz));
  vec4 downX = getImageValue(vec3(max(0.0, voxelCoords.x - 1.0), voxelCoords.yz));

  vec4 upY = getImageValue(vec3(voxelCoords.x, min(uVoxelCount.y - 1.0, voxelCoords.y + 1.0), voxelCoords.z));
  vec4 downY = getImageValue(vec3(voxelCoords.x, max(0.0, voxelCoords.y - 1.0), voxelCoords.z));

  vec4 upZ = getImageValue(vec3(voxelCoords.xy, min(uVoxelCount.z - 1.0, voxelCoords.z + 1.0)));
  vec4 downZ = getImageValue(vec3(voxelCoords.xy, max(0.0, voxelCoords.z - 1.0)));
  
  vec3 up;
  vec3 down;

  if (uInputDimensions == 4.0) {
    up.x = length(upX);
    up.y = length(upY);
    up.z = length(upZ);
    down.x = length(downX);
    down.y = length(downY);
    down.z = length(downZ);
  } else if (uInputDimensions == 3.0) {
    up.x = length(upX.xyz);
    up.y = length(upY.xyz);
    up.z = length(upZ.xyz);
    down.x = length(downX.xyz);
    down.y = length(downY.xyz);
    down.z = length(downZ.xyz);
  } else if (uInputDimensions == 2.0) {
    up.x = length(upX.xy);
    up.y = length(upY.xy);
    up.z = length(upZ.xy);
    down.x = length(downX.xy);
    down.y = length(downY.xy);
    down.z = length(downZ.xy);
  } else {
    up.x = length(upX.x);
    up.y = length(upY.x);
    up.z = length(upZ.x);
    down.x = length(downX.x);
    down.y = length(downY.x);
    down.z = length(downZ.x);
  }

  vec3 gradient = (up - down) / (mix(vec3(1.0), vec3(2.0), step(0.5, mod(voxelCoords, uVoxelCount - vec3(1.0)))) * uVoxelSpacing);
  
  float encodedSigns = 0.5 * step(0.0, gradient.x) + 0.25 * step(0.0, gradient.y) + 0.125 * step(0.0, gradient.z);

  // Disregarding the voxels at the edges of the volume, the absolute value of the 
  // components of gradient are at most sqrt(inputDimensions)/(2*min(voxelSpacing)).
  // As we want to use the whole range [0, 1] for the result we scale by this value.
  //
  // TODO: Think about scaling by a bigger value, because the gradient tends to be rather small.
  float gradientScaleFactor = 2.0 * min(uVoxelSpacing.x, min(uVoxelSpacing.y, uVoxelSpacing.z)) / sqrt(uInputDimensions);

  gl_FragColor = vec4(abs(gradient) * gradientScaleFactor, encodedSigns);
}