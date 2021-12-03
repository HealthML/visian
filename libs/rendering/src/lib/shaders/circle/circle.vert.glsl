#ifdef POINTS
  uniform float uPointSize;
#else
  varying vec2 vUv;
#endif


void main() {
  #ifdef POINTS
    gl_PointSize = uPointSize;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #else
    vUv = uv;
    gl_Position = projectionMatrix * instanceMatrix * vec4(position, 1.0);
  #endif // POINTS

}
