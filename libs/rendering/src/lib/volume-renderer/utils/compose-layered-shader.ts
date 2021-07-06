const generateReduceLayerStack = (
  layerCount: number,
  outputName = "imageValue",
  uvName = "uv",
  reduceAnnotations?: boolean,
) => {
  let fragment = "";
  for (let i = 0; i < layerCount; i++) {
    fragment += `${outputName} += texture2D(uLayerData[${i}], ${uvName});\n`;
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
