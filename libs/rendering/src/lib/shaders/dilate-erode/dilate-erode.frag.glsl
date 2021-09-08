varying vec2 vUv;

uniform sampler2D uTargetTexture;

uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

uniform bool uShouldErode;

// TODO: Eliminate code duplication (see region growing 3D fragment shader)
void main() {
  vec4 target = texture2D(uTargetTexture, vUv);

  vec2 sliceSize = vec2(1.0) / uAtlasGrid;
  vec2 sliceTilePosition = floor(vUv / sliceSize);
  float z = uAtlasGrid.x * sliceTilePosition.y + sliceTilePosition.x;

  if (z >= uVoxelCount.z) {
    gl_FragColor = vec4(vec3(0.0), 1.0);
    return;
  }

  vec2 offsetInSlice = fract(vUv / sliceSize);
  vec3 voxelCoords = vec3(offsetInSlice * uVoxelCount.xy, z);

  vec2 texelStep = vec2(1.0) / (uAtlasGrid * uVoxelCount.xy);

  // right, left
  vec2 uvR = vec2(vUv.x + texelStep.x, vUv.y);
  vec2 uvL = vec2(vUv.x - texelStep.x, vUv.y);

  // up, down
  vec2 uvU = vec2(vUv.x, vUv.y + texelStep.y);
  vec2 uvD = vec2(vUv.x, vUv.y - texelStep.y);
  
  float lastInSliceRow = clamp(sliceTilePosition.x - uAtlasGrid.x + 2.0, 0.0, 1.0);
  vec2 uvOffsetB = mix(
    vec2(sliceSize.x, 0.0), 
    vec2(-sliceSize.x * (uAtlasGrid.x - 1.0), sliceSize.y), 
    lastInSliceRow
  );
  // back
  vec2 uvB = vUv + uvOffsetB;

  float firstInSliceRow = clamp(1.0 - sliceTilePosition.x , 0.0, 1.0);
  vec2 uvOffsetF = mix(
    vec2(-sliceSize.x, 0.0), 
    vec2(sliceSize.x * (uAtlasGrid.x - 1.0), -sliceSize.y), 
    firstInSliceRow
  );
  // front
  vec2 uvF = vUv + uvOffsetF;

  // right, left, up, down, back, front
  vec4 targetR = texture2D(uTargetTexture, uvR);
  vec4 targetL = texture2D(uTargetTexture, uvL);
  vec4 targetU = texture2D(uTargetTexture, uvU);
  vec4 targetD = texture2D(uTargetTexture, uvD);
  vec4 targetB = texture2D(uTargetTexture, uvB);
  vec4 targetF = texture2D(uTargetTexture, uvF);

  if (uShouldErode) {
    gl_FragColor = vec4(vec3(min(target, min(targetR, min(targetL, min(targetU, min(targetD, min(targetB, targetF))))))), 1.0);
  } else {
    gl_FragColor = vec4(vec3(max(target, max(targetR, max(targetL, max(targetU, max(targetD, max(targetB, targetF))))))), 1.0);
  }
}
