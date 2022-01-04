precision highp sampler3D;

#define VOLUMETRIC_IMAGE

in vec2 vUv;

uniform int uInputDimensions;
uniform int uGradientMode;

@import ../uniforms/u-common;
@import ../uniforms/u-image-info;
@import ../uniforms/u-transfer-functions;
@import ../uniforms/u-texture-3d-material;

#define CONE_EDGE 0.01

@import ../utils/volume-data;
@import ../volume/transfer-functions;
@import ../utils/decode-vec3;

out vec4 pc_FragColor;

vec4 encodeGradient(vec3 gradient) {
  float encodedSigns = 0.5 * step(0.0, gradient.x) + 0.25 * step(0.0, gradient.y) + 0.125 * step(0.0, gradient.z);
  return vec4(abs(gradient), encodedSigns);
}

/**
 * Returns the image value at the given volume coordinates.
 *
 * @param voxelCoords The voxel coordinates (ranged [0, uVoxelCount.* - 1.0]).
 */
vec4 getImageValue(vec3 uv) {
  if (uGradientMode == 2) {
    return texture(uInputFirstDerivative, uv);
  } else if (uGradientMode == 1) {
    vec4 imageValue = vec4(0.0);
    {{reduceRawImages(imageValue, uv)}}
    return imageValue;
  }
  
  vec4 imageValue = vec4(0.0);
  vec4 imageRaw = vec4(0.0);
  {{reduceLayerStack(imageValue, uv, false, imageRaw)}}
  VolumeData data;

  data.image = imageValue;
  data.imageRaw = imageRaw;
  data.firstDerivative = decodeVec3(texture(uInputFirstDerivative, uv));
  // data.secondDerivative = decodeVec3(texture(uInputSecondDerivative, uv));
  
  if(uUseFocus) {
    vec4 focusValue = vec4(0.0);
    {{reduceLayerStack(focusValue, uv, true)}}
    data.annotation = focusValue;
  }

  vec4 outputValue = transferFunction(data, uv);

  return vec4(outputValue.a);
}

void main() {
  vec3 uv = vec3(vUv, (uSlice + 0.5) / uSize.z);

  if(uTransferFunction == 2) {
    vec3 coneSpaceCoordinates = transformToCutawaySpace(uv);
    float coneDist = sdCone(coneSpaceCoordinates, uConeAngle);
    if (coneDist > -CONE_EDGE && coneDist < CONE_EDGE) {
      // TODO: Compute the normal of the cone surface here.
      pc_FragColor = vec4(0.0);
      return;
    }
  }

  @import ../utils/neighbor-uvs;

  vec4 upX = getImageValue(vec3(min(1.0, uvR.x), uvR.yz));
  vec4 downX = getImageValue(vec3(max(0.0, uvL.x), uvL.yz));

  vec4 upY = getImageValue(vec3(uvU.x, min(1.0, uvU.y), uvU.z));
  vec4 downY = getImageValue(vec3(uvD.x, max(0.0, uvD.y), uvD.z));

  vec4 upZ = getImageValue(vec3(uvB.xy, min(1.0, uvB.z)));
  vec4 downZ = getImageValue(vec3(uvF.xy, max(0.0, uvF.z)));
  
  vec3 up;
  vec3 down;

  if (uInputDimensions == 4) {
    up.x = length(upX);
    up.y = length(upY);
    up.z = length(upZ);
    down.x = length(downX);
    down.y = length(downY);
    down.z = length(downZ);
  } else if (uInputDimensions == 3) {
    up.x = length(upX.xyz);
    up.y = length(upY.xyz);
    up.z = length(upZ.xyz);
    down.x = length(downX.xyz);
    down.y = length(downY.xyz);
    down.z = length(downZ.xyz);
  } else if (uInputDimensions == 2) {
    up.x = length(upX.xy);
    up.y = length(upY.xy);
    up.z = length(upZ.xy);
    down.x = length(downX.xy);
    down.y = length(downY.xy);
    down.z = length(downZ.xy);
  } else {
    up.x = upX.x;
    up.y = upY.x;
    up.z = upZ.x;
    down.x = downX.x;
    down.y = downY.x;
    down.z = downZ.x;
  }

  vec3 gradient = (up - down) / (2.0 * uVoxelSpacing);

  if (uGradientMode == 0) {
    gradient *= -1.0;
  }
  
  vec4 encodedGradient = encodeGradient(gradient);

  // Disregarding the voxels at the edges of the volume, the absolute value of the 
  // components of gradient are at most sqrt(inputDimensions)/(2*min(voxelSpacing)).
  // As we want to use the whole range [0, 1] for the result we scale by this value.
  //
  // TODO: Think about scaling by a bigger value, because the gradient tends to be rather small.
  float gradientScaleFactor = 2.0 * min(uVoxelSpacing.x, min(uVoxelSpacing.y, uVoxelSpacing.z)) / sqrt(float(uInputDimensions));

  pc_FragColor = vec4(encodedGradient.xyz * gradientScaleFactor, encodedGradient.w);
}