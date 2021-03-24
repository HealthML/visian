// TODO: These should be uniforms.
float ambient = 0.6;
vec3 lightPosition = vec3(2.0); // In volume coordinates.
float intensity = 1.0;
float shinyness = 15.0;

vec4 phong(vec4 volumeColor, VolumeData volumeData, vec3 volumeCoords) {
  vec3 specularColor = vec3(0.8) + 0.2 * volumeColor.rgb;
  
  vec3 normal = volumeData.normal;

  vec3 lightDirection = normalize(lightPosition - volumeCoords);
  vec3 reflectionDirection = reflect(-lightDirection, normal);
  vec3 viewDirection = normalize(uCameraPosition - volumeCoords);

  float diffuse = max(0.0, dot(lightDirection, normal));
  float specular = pow(max(dot(reflectionDirection, viewDirection), 0.0), shinyness);

  return vec4((ambient + intensity * diffuse) * volumeColor.rgb + specularColor * specular, volumeColor.a);
}
