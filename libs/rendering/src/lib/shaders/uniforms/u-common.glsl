uniform vec3 uCameraPosition;
uniform sampler2D uInputFirstDerivative;
uniform sampler2D uInputSecondDerivative;
uniform float uStepSize;

uniform sampler2D uLayerData[{{layerCount}}];
uniform bool uLayerAnnotationStatuses[{{layerCount}}];
uniform bool uLayerVisibilities[{{layerCount}}];
uniform float uLayerOpacities[{{layerCount}}];
uniform vec3 uLayerColors[{{layerCount}}];
