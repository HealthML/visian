attribute float instanceColor;

varying vec2 vUv;
varying float vColor;

void main() {
  vUv = uv;
  vColor = instanceColor;

  gl_Position = projectionMatrix * instanceMatrix * vec4(position, 1.0);
}
