varying vec2 vUv;

void main() {
  // Make the plane round.
  if (length(vUv - 0.5) >= 0.5) discard;

  gl_FragColor = vec4(1.0);
}
