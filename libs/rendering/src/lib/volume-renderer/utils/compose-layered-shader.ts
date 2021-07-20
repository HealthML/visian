const generateReduceLayerStack = (
  layerCount: number,
  outputName = "imageValue",
  uvName = "uv",
  reduceAnnotations?: boolean,
  rawOutputName?: string,
) => {
  const alpha = `_alpha${Math.floor(Math.random() * 1000)}`;
  let fragment = `float ${alpha} = 0.0;\n`;
  for (let i = 0; i < layerCount; i++) {
    const filter = `(${
      reduceAnnotations ? "" : "1.0 - "
    }float(uLayerAnnotationStatuses[${i}]))`;

    fragment += `${alpha} = texture2D(uLayerData[${i}], ${uvName}).r;`;

    if (rawOutputName) {
      fragment += `
      ${rawOutputName}.rgb += ${filter} * (1.0 - ${rawOutputName}.a) * ${alpha};
      ${rawOutputName}.a += ${filter} * (1.0 - ${rawOutputName}.a) * ${alpha};
      `;
    }

    fragment += `
    ${alpha} *= uLayerOpacities[${i}];
    ${outputName}.rgb += ${filter} * (1.0 - ${outputName}.a) * uLayerColors[${i}] * ${alpha};
    ${outputName}.a += ${filter} * (1.0 - ${outputName}.a) * ${alpha};
    `;
  }
  return fragment;
};

const generateReduceLayerColors = (
  layerCount: number,
  outputName = "imageColor",
  reduceAnnotations?: boolean,
) => {
  let fragment = "";
  for (let i = 0; i < layerCount; i++) {
    const filter = `(${
      reduceAnnotations ? "" : "1.0 - "
    }float(uLayerAnnotationStatuses[${i}]))`;

    fragment += `
    ${outputName}.rgb += ${filter} * (1.0 - ${outputName}.a) * uLayerColors[${i}] * uLayerOpacities[${i}];
    ${outputName}.a += ${filter} * (1.0 - ${outputName}.a) * uLayerOpacities[${i}];
    `;
  }
  return fragment;
};

const layerCountRegex = /{{layerCount}}/g;
const reduceLayerStackRegex = /{{reduceLayerStack\((\w+),\s*(\w+),\s*(\w+)(,\s*(\w+))?\)}}/g;
const reduceLayerColorsRegex = /{{reduceLayerColors\((\w+),\s*(\w+)\)}}/g;
export const composeLayeredShader = (shader: string, layerCount: number) =>
  shader
    .replace(layerCountRegex, `${layerCount}`)
    .replace(
      reduceLayerStackRegex,
      (
        _match,
        outputName,
        uvName,
        reduceAnnotations,
        _fullRawOutputName,
        rawOutputName,
      ) =>
        generateReduceLayerStack(
          layerCount,
          outputName,
          uvName,
          reduceAnnotations === "true",
          rawOutputName,
        ),
    )
    .replace(reduceLayerColorsRegex, (_match, outputName, reduceAnnotations) =>
      generateReduceLayerColors(
        layerCount,
        outputName,
        reduceAnnotations === "true",
      ),
    );
