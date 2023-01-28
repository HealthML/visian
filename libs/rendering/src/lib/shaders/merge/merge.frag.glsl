precision highp sampler3D;

in vec2 vUv;

#ifdef VOLUME_TEXTURE
  uniform sampler3D uDataTexture;
  uniform float uDepth;
#else
  uniform sampler2D uDataTexture;
#endif
uniform int uMergeFunction;
uniform bool uUseThreshold;
uniform float uThreshold;

out vec4 pc_FragColor;

void main() {
  #ifdef VOLUME_TEXTURE
    vec4 data = texture(uDataTexture, vec3(vUv, uDepth));
  #else
    vec4 data = texture(uDataTexture, vUv);
  #endif

  if (uUseThreshold) {
    if (data.r < uThreshold) {
      discard;
    }
    
    if (uMergeFunction == 2) { // Subtract
      pc_FragColor = vec4(vec3(0.0), 1.0);
    } else {
      pc_FragColor = vec4(1.0);
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

    pc_FragColor = data;
  }
}
