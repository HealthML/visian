// The position within the volume. Ranging [0, 1] in each dimension.
varying vec3 vPosition;

uniform sampler2D uVolume;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

void main() {
  vec2 sliceSize = vec2(1.0) / vec2(uAtlasGrid.x, uAtlasGrid.y);
  vec2 delta = vec2(
    mod(floor(vPosition.z * uVoxelCount.z), uAtlasGrid.x), 
    floor(vPosition.z * uVoxelCount.z / uAtlasGrid.x)
  );
  vec2 uvDelta = sliceSize * delta;
  // TODO: Do we need `fract` here?
  vec2 uv = vPosition.xy / uAtlasGrid + uvDelta;
  vec4 textureOutput = texture2D(uVolume, uv);

  gl_FragColor = textureOutput;
}
