/** The position within the volume. Ranging [0, 1] in each dimension. */
varying vec3 vPosition;
varying vec3 vRayDirection;
varying vec3 vRayOrigin;

uniform vec3 uCameraPosition;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vRayDirection = position - uCameraPosition;
  vRayOrigin = uCameraPosition + vec3(0.5);

  // The input position is in the range [-0.5, 0.5]. We need to adjust to [0, 1].
  vPosition = position + vec3(0.5);
}
