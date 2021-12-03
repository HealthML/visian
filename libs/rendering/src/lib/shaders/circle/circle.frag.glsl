#ifdef COLOR
  uniform vec3 uColor;
#endif

#ifndef POINTS
  varying vec2 vUv;
#endif

void main() {
  #ifdef POINTS
    vec2 vUv = gl_PointCoord;
  #endif

  // Make the plane round.
  if (length(vUv - 0.5) >= 0.5) discard;

  #ifdef COLOR
    gl_FragColor = vec4(uColor, 1.0);
  #else
    gl_FragColor = vec4(1.0);
  #endif
}
