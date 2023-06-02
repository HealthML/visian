#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uTargetTexture;
#else
  uniform sampler2D uTargetTexture;
#endif
uniform float uRenderValue;
