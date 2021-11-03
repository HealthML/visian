#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uSourceTexture;
  uniform sampler3D uTargetTexture;
#else
  uniform sampler2D uSourceTexture;
  uniform sampler2D uTargetTexture;
#endif
uniform float uRenderValue;
