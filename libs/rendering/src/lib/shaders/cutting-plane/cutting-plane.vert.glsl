attribute vec3 volumeCoords;

varying vec3 vVolumeCoords;

void main() {
  vVolumeCoords = volumeCoords;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
