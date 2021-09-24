varying vec2 vUv;

uniform sampler2D uSourceTexture;

uniform vec2 uThreshold;

void main() {
  vec4 source = texture2D(uSourceTexture, vUv);
  gl_FragColor = vec4(step(uThreshold.x, source.r) * step(source.r, uThreshold.y));
}
