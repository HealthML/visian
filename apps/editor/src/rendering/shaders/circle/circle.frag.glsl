varying vec3 vColor;

void main() {
  // Make the points round.
  if (length(gl_PointCoord - 0.5) >= 0.5) discard;

  gl_FragColor = vec4(vColor, 1.0);
}
