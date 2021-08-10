/* eslint-disable max-len */

/**
 * Generates the GLSL code for the `reduceLayerStack` macro which blends the
 * image data of all layers, taking into account their layer settings.
 *
 * @param layerCount The number of layers.
 * @param outputName The output variable to assign the blended color to.
 * @param uvName The name of the variable holding the current UV coordinates.
 * @param reduceAnnotations If set, blends only annotation layers. If not,
 * blends only non-annotation layers.
 * @param rawOutputName The optional name of the output variable to receive the
 * raw blended image data (without respecting the layer color or opacity).
 * @returns The generated GLSL code.
 */
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
    fragment += `${alpha} = texture2D(uLayerData[${i}], ${uvName}).r;
    `;

    if (i === 0) {
      // Region growing preview
      fragment += `${alpha} = step(uRegionGrowingThreshold, ${alpha});
      `;
    }

    const filter = `(${
      reduceAnnotations ? "" : "1.0 - "
    }float(uLayerAnnotationStatuses[${i}]))`;

    if (rawOutputName) {
      fragment += `
      ${rawOutputName}.rgb += ${filter} * (1.0 - ${rawOutputName}.a) * ${alpha} * step(0.0, uLayerOpacities[${i}]);
      ${rawOutputName}.a += ${filter} * (1.0 - ${rawOutputName}.a) * ${alpha} * step(0.0, uLayerOpacities[${i}]);
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

const generateReduceRawImages = (
  layerCount: number,
  outputName = "imageValue",
  uvName = "uv",
) => {
  const alpha = `_alpha${Math.floor(Math.random() * 1000)}`;

  let fragment = `
  float ${alpha} = 0.0;`;

  for (let i = 0; i < layerCount; i++) {
    fragment += `
    ${alpha} = texture2D(uLayerData[${i}], ${uvName}).r;
    ${outputName} += (1.0 - float(uLayerAnnotationStatuses[${i}])) * (1.0 - ${outputName}.a) * ${alpha} * uLayerOpacities[${i}] * step(0.0, uLayerOpacities[${i}]);`;
  }

  return fragment;
};

// Macro definitions
const layerCountRegex = /{{layerCount}}/g;
const reduceLayerStackRegex = /{{reduceLayerStack\((\w+),\s*(\w+),\s*(\w+)(,\s*(\w+))?\)}}/g;
const reduceRawImagesRegex = /{{reduceRawImages\((\w+),\s*(\w+)\)}}/g;

/**
 * Pre-processes a given shader string to replace custom macros with
 * procedurally generated GLSL code.
 *
 * @param shader The shader string.
 * @param layerCount The number of layers the shader should be instantiated for.
 * @returns The processed shader string.
 */
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
    .replace(reduceRawImagesRegex, (_match, outputName, uvName) =>
      generateReduceRawImages(layerCount, outputName, uvName),
    );
