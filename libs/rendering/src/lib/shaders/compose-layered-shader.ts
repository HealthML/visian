/* eslint-disable max-len */

import { BlendGroup, IImageLayer } from "@visian/ui-shared";

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
  const accumulatedAnnotations = `_accumulatedAnnotations${Math.floor(
    Math.random() * 1000,
  )}`;
  let fragment = `
  float ${alpha} = 0.0;
  float ${activeLayer} = texture(uActiveLayerData, ${uvName}).r;
  `;
  if (reduceAnnotations) {
    fragment += `
    float ${accumulatedAnnotations} = 0.0;
    `;
  }

  for (let i = 0; i < layerCount; i++) {
    fragment += `${alpha} = texture(uLayerData[${i}], ${uvName}).r;
    `;

    if (i === 0) {
      // Region growing preview
      fragment += `
      ${alpha} = step(uRegionGrowingThreshold, ${alpha});
      ${alpha} *= 1.0 - step(0.001, ${activeLayer});
      `;
    }

    if (reduceAnnotations) {
      fragment += `
      if(uUseExclusiveSegmentations) {
        ${alpha} = mix(${alpha}, 0.0, step(0.001, ${accumulatedAnnotations}));
        ${accumulatedAnnotations} = mix(${accumulatedAnnotations}, 1.0, step(0.001, ${alpha} * step(0.001, uLayerOpacities[${i}])));
      }
      `;
    }

    const filter = `(${
      reduceAnnotations ? "" : "1.0 - "
    }float(uLayerAnnotationStatuses[${i}]))`;

    if (rawOutputName) {
      fragment += `
      ${rawOutputName}.rgb += ${filter} * (1.0 - ${rawOutputName}.a) * ${alpha} * step(0.001, uLayerOpacities[${i}]);
      ${rawOutputName}.a += ${filter} * (1.0 - ${rawOutputName}.a) * ${alpha} * step(0.001, uLayerOpacities[${i}]);
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
 * Generates the GLSL code for the `reduceEnhancedLayerStack` macro which processes one single layer.
 *
 * @param layerIndex The index of the layers.
 * @param image The variable name for the result in the shader code.
 * @param activeLayer The variable name for the active layer in the shader code.
 * @param accumulatedAnnotations The variable name for the accumulated annotations in the shader code.
 * @param volumeCoords The name of the variable holding the current UV coordinates.
 * @param enhancementFunctionName The optional name of the function which is
 * applied to every non-annotation layer before blending.
 * @returns The generated GLSL code.
 */
const simpleLayerProcessing = (
  layerIndex: number,
  image: string,
  activeLayer: string,
  accumulatedAnnotations: string,
  volumeCoords = "volumeCoords",
  activeLayerMergeName?: string,
  enhancementFunctionName?: string,
) => {
  let fragment = `${image} = texture(uLayerData[${layerIndex}], ${volumeCoords});
    `;

  if (activeLayerMergeName) {
    fragment += `${image} = mix(
        ${image}, 
        uToolPreviewMerge == 1
        ? max(${image}, ${activeLayerMergeName})
        : clamp(${image} - ${activeLayerMergeName}, 0.0, 1.0),
        float(${layerIndex} == uActiveLayerIndex && uLayerAnnotationStatuses[${layerIndex}])
        );
        `;
  }

  if (layerIndex === -1) {
    // Region growing preview
    fragment += `
      ${image}.rgb = step(uRegionGrowingThreshold, ${image}.rgb);
      ${image}.rgb *= vec3(1.0) - step(0.001, ${activeLayer}.rgb);
      `;
  }

  fragment += `
    if(uComponents < 3 || uLayerAnnotationStatuses[${layerIndex}]) {
      ${image}.a = ${image}.x;
      ${image}.rgb = uLayerColors[${layerIndex}];
    }

    if(uUseExclusiveSegmentations && uLayerAnnotationStatuses[${layerIndex}]) {
      ${image}.a = mix(${image}.a, 0.0, step(0.001, ${accumulatedAnnotations}));
      ${accumulatedAnnotations} = mix(${accumulatedAnnotations}, 1.0, step(0.001, ${image}.a * step(0.001, uLayerOpacities[${layerIndex}])));
    }

    if(uLayerAnnotationStatuses[${layerIndex}]) {
      ${image}.a = step(0.01, ${image}.a);
    } ${
      enhancementFunctionName
        ? `else {
      ${image} = ${enhancementFunctionName}(${image});
    }`
        : ""
    }
    
    ${image}.a *= uLayerOpacities[${layerIndex}];
    `;

  return fragment;
};

/**
 * Generates the GLSL code for the `reduceEnhancedLayerStack` macro which compares two annotation layers.
 *
 * @param layerIndizes The indizes of the layers to compare.
 * @param image The variable name for the result in the shader code.
 * @param activeLayer The variable name for the active layer in the shader code.
 * @param accumulatedAnnotations The variable name for the accumulated annotations in the shader code.
 * @param volumeCoords The name of the variable holding the current UV coordinates.
 * @param enhancementFunctionName The optional name of the function which is
 * applied to every non-annotation layer before blending.
 * @returns The generated GLSL code.
 */
const compareLayers = (
  layerIndizes: [number, number],
  image: string,
  activeLayer: string,
  accumulatedAnnotations: string,
  volumeCoords = "volumeCoords",
  activeLayerMergeName?: string,
  enhancementFunctionName?: string,
) => {
  const layer1 = `_layer1${Math.floor(Math.random() * 1000)}`;
  const layer2 = `_layer2${Math.floor(Math.random() * 1000)}`;
  const mixedColor = `_mixedColor${Math.floor(Math.random() * 1000)}`;

  let fragment = `
  vec4 ${layer1} = vec4(0.0);
  vec4 ${layer2} = vec4(0.0);
  vec4 ${mixedColor} = mix(
    vec4(uLayerColors[${layerIndizes[0]}], uLayerOpacities[${layerIndizes[0]}]),
    vec4(uLayerColors[${layerIndizes[1]}], uLayerOpacities[${layerIndizes[1]}]),
    0.5
  );
  `;

  fragment += simpleLayerProcessing(
    layerIndizes[0],
    layer1,
    activeLayer,
    accumulatedAnnotations,
    volumeCoords,
    activeLayerMergeName,
    enhancementFunctionName,
  );
  fragment += simpleLayerProcessing(
    layerIndizes[1],
    layer2,
    activeLayer,
    accumulatedAnnotations,
    volumeCoords,
    activeLayerMergeName,
    enhancementFunctionName,
  );

  fragment += `
  ${image} = mix(
    ${layer2},
    mix(
      ${layer1},
      ${mixedColor},
      step(0.0001, ${layer2}.a)
    ),
    step(0.0001, ${layer1}.a)
  );
  `;

  return fragment;
};

/**
 * Generates the GLSL code for the `reduceEnhancedLayerStack` macro which blends the
 * image data of all layers, taking into account their layer settings, after
 * applying an enhancement function to the non-annotation layers.
 *
 * @param layers The layers.
 * @param blendGroups The blend groups.
 * @param outputName The output variable to assign the blended color to.
 * @param volumeCoords The name of the variable holding the current UV coordinates.
 * @param enhancementFunctionName The optional name of the function which is
 * applied to every non-annotation layer before blending.
 * @returns The generated GLSL code.
 */
const generateReduceEnhancedLayerStack = (
  layers: IImageLayer[],
  blendGroups: BlendGroup[],
  outputName = "imageValue",
  volumeCoords = "volumeCoords",
  activeLayerMergeName?: string,
  enhancementFunctionName?: string,
) => {
  const areBlendGroupsUsed = blendGroups.map((_) => false);

  const image = `_image${Math.floor(Math.random() * 1000)}`;
  const activeLayer = `_activeLayer${Math.floor(Math.random() * 1000)}`;
  const oldAlpha = `_oldAlpha${Math.floor(Math.random() * 1000)}`;
  const accumulatedAnnotations = `_accumulatedAnnotations${Math.floor(
    Math.random() * 1000,
  )}`;
  let fragment = `
  vec4 ${image} = vec4(0.0);
  vec4 ${activeLayer} = texture(uActiveLayerData, ${volumeCoords});
  float ${oldAlpha} = 0.0;
  float ${accumulatedAnnotations} = 0.0;
  `;

  for (let i = -1; i < layers.length; i++) {
    if (
      i === -1 ||
      !blendGroups.find((group) => group.layers.includes(layers[i]))
    ) {
      fragment += simpleLayerProcessing(
        i + 1,
        image,
        activeLayer,
        accumulatedAnnotations,
        volumeCoords,
        activeLayerMergeName,
        enhancementFunctionName,
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const blendGroup = blendGroups.find((group) =>
        group.layers.includes(layers[i]),
      )!;
      const blendGroupIndex = blendGroups.indexOf(blendGroup);
      const isBlendGroupUsed = areBlendGroupsUsed[blendGroupIndex];

      // eslint-disable-next-line no-continue
      if (isBlendGroupUsed) continue;

      areBlendGroupsUsed[blendGroupIndex] = true;

      if (blendGroup.mode === "COMPARE") {
        fragment += compareLayers(
          blendGroup.layers.map((layer) => layers.indexOf(layer) + 1) as [
            number,
            number,
          ],
          image,
          activeLayer,
          accumulatedAnnotations,
          volumeCoords,
          activeLayerMergeName,
          enhancementFunctionName,
        );
      } else if (blendGroup.mode === "MAJORITY_VOTE") {
        // TODO: Implement majority rendering
      } else {
        throw new Error("unexpected-blend-mode");
      }
    }

    // Blend result behind previous layers
    fragment += `
    ${oldAlpha} = ${outputName}.a;
    ${outputName}.a = mix(${image}.a, 1.0, ${oldAlpha});
    ${outputName}.rgb = mix(
      ${image}.a * ${image}.rgb,
      ${outputName}.rgb,
      ${oldAlpha}) / max(${outputName}.a, 0.00001); // avoid division by 0
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
    ${alpha} = texture(uLayerData[${i}], ${uvName}).r;
    ${outputName} += (1.0 - float(uLayerAnnotationStatuses[${i}])) * (1.0 - ${outputName}.a) * ${alpha} * uLayerOpacities[${i}];`;
  }

  return fragment;
};

// Macro definitions
const layerCountRegex = /{{layerCount}}/g;
const reduceLayerStackRegex = /{{reduceLayerStack\((\w+),\s*(\w+),\s*(\w+)(,\s*(\w+))?\)}}/g;
const reduceEnhancedLayerStackRegex = /{{reduceEnhancedLayerStack\((\w+),\s*(\w+)(,\s*(\w+),\s*(\w+))?\)}}/g;
const reduceRawImagesRegex = /{{reduceRawImages\((\w+),\s*(\w+)\)}}/g;

/**
 * Pre-processes a given shader string to replace custom macros with
 * procedurally generated GLSL code.
 *
 * @param shader The shader string.
 * @param layers The layers the shader should be instantiated for.
 * @param blendGroups The blend groups the shader should use.
 * @returns The processed shader string.
 */
export const composeLayeredShader = (
  shader: string,
  layers: IImageLayer[],
  blendGroups: BlendGroup[],
) => {
  // Addtional layer for tool preview.
  const layerCount = layers.length + 1;

  return shader
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
    .replace(
      reduceEnhancedLayerStackRegex,
      (
        _match,
        outputName,
        uvName,
        _fullOptionalNames,
        activeLayerMergeName,
        enhancementFunctionName,
      ) =>
        generateReduceEnhancedLayerStack(
          layers,
          blendGroups,
          outputName,
          uvName,
          activeLayerMergeName,
          enhancementFunctionName,
        ),
    )
    .replace(reduceRawImagesRegex, (_match, outputName, uvName) =>
      generateReduceRawImages(layerCount, outputName, uvName),
    );
};
