varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform float uThreshold;

void main() {
  float data = texture2D(uDataTexture, vUv).x;

  if(data < uThreshold) {
    discard;
  }
  
  gl_FragColor = vec4(1.0);
}
