#ifdef VOLUMETRIC_IMAGE
  vec3 texelStep = vec3(1.0) / uSize;

  // right, left
  vec3 uvR = vec3(uv.x + texelStep.x, uv.yz);
  vec3 uvL = vec3(uv.x - texelStep.x, uv.yz);

  // up, down
  vec3 uvU = vec3(uv.x, uv.y + texelStep.y, uv.z);
  vec3 uvD = vec3(uv.x, uv.y - texelStep.y, uv.z);

  // back, front
  vec3 uvB = vec3(uv.xy, uv.z + texelStep.z);
  vec3 uvF = vec3(uv.xy, uv.z - texelStep.z);
#else
  vec2 texelStep = vec2(1.0) / uSize.xy;

  // right, left
  vec2 uvR = vec2(uv.x + texelStep.x, uv.y);
  vec2 uvL = vec2(uv.x - texelStep.x, uv.y);

  // up, down
  vec2 uvU = vec2(uv.x, uv.y + texelStep.y);
  vec2 uvD = vec2(uv.x, uv.y - texelStep.y);
#endif
