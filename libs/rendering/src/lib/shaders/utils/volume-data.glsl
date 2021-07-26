struct VolumeData {
  /**
   * Holds the blended color from all non-annotation image layers, taking
   * into account the layers' colors & opacities.
   */
  vec4 image;

  /**
   * Holds the blended color from all non-annotation image layers, mixing only
   * the raw images without respecting any layer settings (except for the
   * visibility state).
   */
  vec4 imageRaw;

  /**
   * Holds the blended base color from all non-annotation image layers, as
   * defined in the layer settings, weighted by their opacities.
   */
  vec4 imageColor;

  /**
   * Holds the blended image data from all annotation layers, taking
   * into account the layers' colors & opacities.
   */
  vec4 annotation;

  vec3 firstDerivative;
  vec3 secondDerivative;
  vec3 normal;
  float lao;
};
