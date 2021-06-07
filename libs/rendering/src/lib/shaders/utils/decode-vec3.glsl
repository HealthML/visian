vec3 decodeVec3(vec4 encodedVec3) {
  vec3 signs;
  signs.x = mix(-1.0, 1.0, step(0.5, encodedVec3.a));
  signs.y = mix(-1.0, 1.0, step(0.25, mod(encodedVec3.a, 0.5)));
  signs.z = mix(-1.0, 1.0, step(0.125, mod(mod(encodedVec3.a, 0.5), 0.25)));

  return encodedVec3.xyz * signs;
}