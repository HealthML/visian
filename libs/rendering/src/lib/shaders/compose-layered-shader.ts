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
  const activeLayer = `_activeLayer${Math.floor(Math.random() * 1000)}`;
  let fragment = `
  float ${alpha} = 0.0;
  float ${activeLayer} = texture2D(uActiveLayerData, ${uvName}).r;
  `;
  for (let i = 0; i < layerCount; i++) {
    fragment += `${alpha} = texture2D(uLayerData[${i}], ${uvName}).r;
    `;

    if (i === 0) {
      // Region growing preview
      fragment += `
      ${alpha} = step(uRegionGrowingThreshold, ${alpha});
      ${alpha} *= 1.0 - step(0.001, ${activeLayer});
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

/**
 * Generates the GLSL code for the `reduceEnhancedLayerStack` macro which blends the
 * image data of all layers, taking into account their layer settings, after
 * applying an enhancement function to the non-annotation layers.
 *
 * @param layerCount The number of layers.
 * @param outputName The output variable to assign the blended color to.
 * @param volumeCoords The name of the variable holding the current UV coordinates.
 * @param enhancementFunctionName The optional name of the function which is
 * applied to every non-annotation layer before blending.
 * @returns The generated GLSL code.
 */
const generateReduceEnhancedLayerStack = (
  layerCount: number,
  outputName = "imageValue",
  volumeCoords = "volumeCoords",
  activeLayerMergeName = "activeLayerMerge",
  enhancementFunctionName?: string,
) => {
  const image = `_image${Math.floor(Math.random() * 1000)}`;
  const activeLayer = `_activeLayer${Math.floor(Math.random() * 1000)}`;
  const oldAlpha = `_oldAlpha${Math.floor(Math.random() * 1000)}`;
  let fragment = `
  vec4 ${image} = vec4(0.0);
  vec4 ${activeLayer} = texture(uActiveLayerData, ${volumeCoords});
  float ${oldAlpha} = 0.0;
  `;

  for (let i = layerCount - 1; i >= 0; i--) {
    // back to front blending
    fragment += `${image} = texture(uLayerData${i}, ${volumeCoords});
    ${image} = mix(
      ${image}, 
      uToolPreviewMerge == 1
        ? max(${image}, ${activeLayerMergeName})
        : clamp(${image} - ${activeLayerMergeName}, 0.0, 1.0),
      float(${i} == uActiveLayerIndex && uLayerAnnotationStatuses[${i}])
    );
    `;

    if (i === 0) {
      // Region growing preview
      fragment += `
      ${image}.rgb = step(uRegionGrowingThreshold, ${image}.rgb);
      ${image}.rgb *= vec3(1.0) - step(0.001, ${activeLayer}.rgb);
      `;
    }

    fragment += `
    if(uComponents < 3 || uLayerAnnotationStatuses[${i}]) {
      ${image}.a = ${image}.x;
      ${image}.rgb = uLayerColors[${i}];
    }

    if(uLayerAnnotationStatuses[${i}]) {
      ${image}.a = step(0.01, ${image}.a);
    } ${
      enhancementFunctionName
        ? `else {
      ${image} = ${enhancementFunctionName}(${image});
    }`
        : ""
    }
    
    ${image}.a *= uLayerOpacities[${i}];
    
    ${oldAlpha} = ${outputName}.a;
    ${outputName}.a = mix(${oldAlpha}, 1.0, ${image}.a);
    ${outputName}.rgb = mix(
      ${oldAlpha} * ${outputName}.rgb,
      ${image}.rgb,
      ${image}.a) / max(${outputName}.a, 0.00001); // avoid division by 0
    `;
  }

  return fragment;
};

/**
 * Generates the GLSL code for the `reduceRawImages` macro which blends the
 * raw image data of all non-annotation layers, taking into account their opacities.
 *
 * @param layerCount The number of layers.
 * @param outputName The output variable to assign the blended color to.
 * @param uvName The name of the variable holding the current UV coordinates.
 * @returns The generated GLSL code.
 */
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
    ${outputName} += (1.0 - float(uLayerAnnotationStatuses[${i}])) * (1.0 - ${outputName}.a) * ${alpha} * uLayerOpacities[${i}];`;
  }

  return fragment;
};

const generateLayerData = (layerCount: number) => {
  let fragment = "";
  for (let i = 0; i < layerCount; i++) {
    fragment += `uniform sampler3D uLayerData${i};
    `;
  }
  return fragment;
};

// Macro definitions
const layerCountRegex = /{{layerCount}}/g;
const layerDataRegex = /{{layerData}}/g;
const reduceLayerStackRegex = /{{reduceLayerStack\((\w+),\s*(\w+),\s*(\w+)(,\s*(\w+))?\)}}/g;
const reduceEnhancedLayerStackRegex = /{{reduceEnhancedLayerStack\((\w+),\s*(\w+),\s*(\w+)(,\s*(\w+))?\)}}/g;
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
    .replace(layerDataRegex, generateLayerData(layerCount))
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
    .replace(
      reduceEnhancedLayerStackRegex,
      (
        _match,
        outputName,
        uvName,
        activeLayerMergeName,
        _fullEnhancementFunctionName,
        enhancementFunctionName,
      ) =>
        generateReduceEnhancedLayerStack(
          layerCount,
          outputName,
          uvName,
          activeLayerMergeName,
          enhancementFunctionName,
        ),
    )
    .replace(reduceRawImagesRegex, (_match, outputName, uvName) =>
      generateReduceRawImages(layerCount, outputName, uvName),
    );
