uniform vec3 uCameraPosition;
uniform sampler3D uInputFirstDerivative;
uniform sampler3D uInputSecondDerivative;
uniform float uStepSize;

#ifdef VOLUMETRIC_IMAGE
  uniform sampler3D uLayerData[{{layerCount}}];
#else 
  uniform sampler2D uLayerData[{{layerCount}}];
#endif
uniform bool uLayerAnnotationStatuses[{{layerCount}}];
uniform float uLayerOpacities[{{layerCount}}];
uniform vec3 uLayerColors[{{layerCount}}];

uniform sampler3D uActiveLayerData;
uniform float uRegionGrowingThreshold;

uniform bool uUseExclusiveSegmentations;
