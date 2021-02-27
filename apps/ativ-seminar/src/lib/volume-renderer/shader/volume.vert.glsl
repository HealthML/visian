// The position within the volume. Ranging [0, 1] in each dimension.
varying vec3 vPosition;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  // The input position is in the range [-0.5, 0.5]. We need to adjust to [0, 1].
  vPosition = position + vec3(0.5);
}
