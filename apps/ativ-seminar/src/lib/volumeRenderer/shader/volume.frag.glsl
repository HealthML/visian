// The position within the volume. Ranging [0, 1] in each dimension.
varying vec3 vPosition;

void main() {
  gl_FragColor = vec4(vPosition, 1.0);
}
