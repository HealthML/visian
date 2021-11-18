uniform vec3 uCameraPosition;
uniform sampler3D uInputFirstDerivative;
uniform sampler3D uInputSecondDerivative;
uniform float uStepSize;

{{layerData}}
uniform bool uLayerAnnotationStatuses[{{layerCount}}];
uniform float uLayerOpacities[{{layerCount}}];
uniform vec3 uLayerColors[{{layerCount}}];

uniform sampler3D uActiveLayerData;
uniform float uRegionGrowingThreshold;

uniform bool uUseExclusiveAnnotations;
