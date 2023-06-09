uniform sampler2D uNodeTexture;
uniform vec3 uForegroundColor;
uniform vec3 uBackgroundColor;

flat varying int vIsForeground;

void main() {
  vec2 vUv = gl_PointCoord;
  vec4 color = texture2D(uNodeTexture, vUv);

  if(vIsForeground == 1) {
    gl_FragColor = vec4(uForegroundColor, 1.0) * color;
  } else {
    gl_FragColor = vec4(uBackgroundColor, 1.0) * color;
  }
}
