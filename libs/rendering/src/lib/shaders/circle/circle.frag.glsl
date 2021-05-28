varying vec2 vUv;
varying float vColor;

void main() {
  // Make the plane round.
  if (length(vUv - 0.5) >= 0.5) discard;

  gl_FragColor = vec4(vec3(vColor), 1.0);
}
