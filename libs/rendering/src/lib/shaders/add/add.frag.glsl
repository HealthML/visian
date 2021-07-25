varying vec2 vUv;

uniform sampler2D uDataTexture;

void main() {
  vec4 data = texture2D(uDataTexture, vUv);

  if(max(data.r, max(data.g, data.b)) == 0.0) {
    discard;
  }
  
  gl_FragColor = vec4(1.0);
}
