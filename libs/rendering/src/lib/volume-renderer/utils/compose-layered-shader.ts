const generateReduceLayerStack = (
  layerCount: number,
  outputName = "imageValue",
  uvName = "uv",
  reduceAnnotations?: boolean,
) => {
  let fragment = "float _alpha = 0.0;\n";
  for (let i = 0; i < layerCount; i++) {
    fragment += `
    _alpha = texture2D(uLayerData[${i}], ${uvName}).r * uLayerOpacities[${i}];
    ${outputName}.rgb += (1.0 - ${outputName}.a) * uLayerColors[${i}] * _alpha;
    ${outputName}.a += (1.0 - ${outputName}.a) * _alpha;\n
    `;
  }
  return fragment;
};

const layerCountRegex = /{{layerCount}}/g;
const reduceLayerStackRegex = /{{reduceLayerStack\((\w+),\s*(\w+),\s*(\w+)\)}}/g;
export const composeLayeredShader = (shader: string, layerCount: number) =>
  shader
    .replace(layerCountRegex, `${layerCount}`)
    .replace(
      reduceLayerStackRegex,
      (_match, outputName, uvName, reduceAnnotations) =>
        generateReduceLayerStack(
          layerCount,
          outputName,
          uvName,
          reduceAnnotations === "true",
        ),
    );
