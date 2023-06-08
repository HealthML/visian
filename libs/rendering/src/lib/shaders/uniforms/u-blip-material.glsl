@import ./u-tool-3d-material;

#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uTargetTexture;
#else
  uniform sampler2D uTargetTexture;
#endif
uniform float uRenderValue;
