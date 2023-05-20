varying vec2 vUv;

uniform sampler2D uDataTexture;

void main() {
  vec4 partOfMask = texture2D(uDataTexture, vUv);

  if(partOfMask[0] == 0.0) discard;

  gl_FragColor = vec4(1.0);
}
