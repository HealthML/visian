varying vec3 vVolumeCoords;

uniform sampler2D uDataTexture;
uniform vec3 uVoxelCount;
uniform vec2 uAtlasGrid;

void main() {
  vec3 volumeCoords = vVolumeCoords;

  if(
    volumeCoords.x < 0.0 || volumeCoords.y < 0.0 || volumeCoords.z < 0.0 ||
    volumeCoords.x > 1.0 || volumeCoords.y > 1.0 || volumeCoords.z > 1.0 
  ) {
      discard;
    }
  
  @import ../utils/volume-coords-to-uv;

  float density = texture2D(uDataTexture, uv).x;

  if(density < 0.01) discard;

  gl_FragColor = vec4(vec3(density), 1.0);
}