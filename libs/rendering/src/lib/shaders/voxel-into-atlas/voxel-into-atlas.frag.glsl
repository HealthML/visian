#ifdef COLOR
  varying vec3 vColor;
#endif // COLOR

void main() {
  #ifdef COLOR
    gl_FragColor = vec4(vColor, 1.0);
  #else
    gl_FragColor = vec4(1.0);
  #endif // COLOR
}
