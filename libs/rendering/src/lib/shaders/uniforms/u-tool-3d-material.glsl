@import ./u-texture-3d-material;

#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uSourceTexture;
#else
  uniform sampler2D uSourceTexture;
#endif
