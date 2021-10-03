/**
 * Returns the volume data on one slice at the given volume coordinates.
 *
 * @param volumeCoords The volume coordinates (ranged [0, 1]).
 */
VolumeData getVolumeData(vec3 volumeCoords) {
  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  float zSlice = floor(volumeCoords.z * uVoxelCount.z + 0.5);
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

  vec4 imageValue = vec4(0.0);
  vec4 imageRaw = vec4(0.0);
  {{reduceLayerStack(imageValue, uv, false, imageRaw)}}

  data.image = imageValue;
  data.imageRaw = imageRaw;
  data.firstDerivative = decodeVec3(texture2D(uInputFirstDerivative, uv));
  data.secondDerivative = decodeVec3(texture2D(uInputSecondDerivative, uv));

  #ifdef NORMAL
    if(uLightingMode == 1) {
      // Here we don't normalize yet, because we need to interpolate before normalizing.
      data.normal = decodeVec3(texture2D(uOutputFirstDerivative, uv));
    }
  #endif // NORMAL

  #ifdef LAO
    if(uLightingMode == 2) {
      data.lao = texture2D(uLAO, uv).x;
    }
  #endif // LAO
  
  if(uUseFocus) {
    vec4 focusValue = vec4(0.0);
    {{reduceLayerStack(focusValue, uv, true)}}
    data.annotation = focusValue;
  }

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

  interpolatedData.image = mix(lowerData.image, upperData.image, uVolumeNearestFiltering ? step(0.5, interpolation) : interpolation);
  interpolatedData.imageRaw = mix(lowerData.imageRaw, upperData.imageRaw, uVolumeNearestFiltering ? step(0.5, interpolation) : interpolation);
  interpolatedData.firstDerivative = mix(lowerData.firstDerivative, upperData.firstDerivative, interpolation);
  interpolatedData.secondDerivative = mix(lowerData.secondDerivative, upperData.secondDerivative, interpolation);

  #ifdef NORMAL
    if(uLightingMode == 1) {
      // Here we normalize after interpolating.
      interpolatedData.normal = normalize(mix(lowerData.normal, upperData.normal, interpolation));
    }
  #endif // NORMAL

  #ifdef LAO
    if(uLightingMode == 2) {
      interpolatedData.lao = mix(lowerData.lao, upperData.lao, interpolation);
    }
  #endif // LAO

  if(uUseFocus) {
    // The focus texture should not be interpolated.
    interpolatedData.annotation = mix(lowerData.annotation, upperData.annotation, uSegmentationLinearFiltering ? interpolation : step(0.5, interpolation));
  }

  return interpolatedData;
}
