varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform int uMergeFunction;
uniform bool uUseThreshold;
uniform float uThreshold;

void main() {
  vec4 data = texture2D(uDataTexture, vUv);

  if (uUseThreshold) {
    if (data.r < uThreshold) {
      discard;
    }
    
    if (uMergeFunction == 2) { // Subtract
      gl_FragColor = vec4(vec3(0.0), 1.0);
    } else {
      gl_FragColor = vec4(1.0);
    }
  } else {
    if (uMergeFunction == 1) { // Add
      if (max(data.r, max(data.g, data.b)) == 0.0) {
        discard;
      }
    } else if (uMergeFunction == 2) { // Subtract
      if (max(data.r, max(data.g, data.b)) == 0.0) {
        discard;
      }
      data.rgb = vec3(0.0);
    }

    gl_FragColor = data;
  }
}
