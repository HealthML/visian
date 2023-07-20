attribute float isForeground;

flat varying int vIsForeground;

uniform float uPointSize;

void main() {
  gl_PointSize = uPointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vIsForeground = int(isForeground);
}
