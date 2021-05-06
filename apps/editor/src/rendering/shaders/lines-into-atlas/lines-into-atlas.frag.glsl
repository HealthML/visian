varying vec2 vUv;

uniform sampler2D uDataTexture;

void main() {
  gl_FragColor = texture2D(uDataTexture, vUv);
}
