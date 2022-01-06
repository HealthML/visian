varying vec2 vUv;

uniform sampler2D uAccumulatedFrame;
uniform sampler2D uNewFrame;

uniform float uAccumulationCount;

void main() {
  vec4 acc = texture2D(uAccumulatedFrame, vUv);
  vec4 new = texture2D(uNewFrame, vUv);

  gl_FragColor = mix(new, acc, 1.0 / (uAccumulationCount + 1.0));
}
