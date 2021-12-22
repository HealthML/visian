uniform float uPointSize;

void main() {
  gl_PointSize = uPointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
