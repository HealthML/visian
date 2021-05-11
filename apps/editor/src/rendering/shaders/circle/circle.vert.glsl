attribute vec3 color;
attribute float radius;

varying vec3 vColor;

void main() {
  vColor = color;

  gl_PointSize = 1.0 + 2.0 * radius;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
