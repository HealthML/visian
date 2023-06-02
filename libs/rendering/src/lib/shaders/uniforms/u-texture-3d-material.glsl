#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uSourceTexture;
#else
  uniform sampler2D uSourceTexture;
#endif
uniform float uSlice;
uniform vec3 uSize;
