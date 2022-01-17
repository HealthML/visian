attribute float textureIndex;

flat varying int vTextureIndex;

uniform float uPointSize;

void main() {
  gl_PointSize = uPointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vTextureIndex = int(textureIndex);
}
