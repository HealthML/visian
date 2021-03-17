vec3 decodeGradient(vec4 encodedGradient) {
  vec3 signs;
  signs.x = mix(-1.0, 1.0, step(0.5, encodedGradient.a));
  signs.y = mix(-1.0, 1.0, step(0.25, mod(encodedGradient.a, 0.5)));
  signs.z = mix(-1.0, 1.0, step(0.125, mod(mod(encodedGradient.a, 0.5), 0.25)));

  return encodedGradient.xyz * signs;
}