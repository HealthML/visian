uniform sampler2D uNodeTexture;
uniform bool uInvertRGB;

void main() {
  vec2 vUv = gl_PointCoord;
  vec4 color = texture2D(uNodeTexture, vUv);

  if(uInvertRGB) {
    color.rgb = vec3(1.0) - color.rgb;
  }

  gl_FragColor = color;
}
