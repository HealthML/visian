uniform sampler2D uNodeTextures[4];
uniform bool uInvertRGB;

flat varying int vTextureIndex;

void main() {

  vec2 vUv = gl_PointCoord;

  // Array access has to be with constant indices...
  vec4 color = texture2D(uNodeTextures[0], vUv);
  if(vTextureIndex == 1) {
    color = texture2D(uNodeTextures[1], vUv);
  }
  else if(vTextureIndex == 2) {
    color = texture2D(uNodeTextures[2], vUv);
  }
  else if(vTextureIndex == 3) {
    color = texture2D(uNodeTextures[3], vUv);
  }

  if(uInvertRGB) {
    color.rgb = vec3(1.0) - color.rgb;
  }

  gl_FragColor = color;
}
