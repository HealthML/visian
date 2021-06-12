import {
  color,
  IConeTransferFunction,
  ICustomTransferFunction,
  IEditor,
  IImageLayer,
  INumberRangeParameter,
  Theme,
} from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";
import { RenderedImage } from "../../rendered-image";
import {
  imageInfoUniforms,
  atlasInfoUniforms,
  commonUniforms,
  transferFunctionsUniforms,
  opacityUniforms,
  lightingUniforms,
} from "../uniforms";
import { shadingModeNameToId, transferFunctionNameToId } from "./conversion";
import { getStepSize } from "./step-size";

export class SharedUniforms implements IDisposable {
  public uniforms: { [uniform: string]: THREE.IUniform };

  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    this.uniforms = THREE.UniformsUtils.merge([
      opacityUniforms,
      commonUniforms,
      atlasInfoUniforms,
      imageInfoUniforms,
      transferFunctionsUniforms,
      lightingUniforms,
    ]);

    this.disposers.push(
      autorun(() => {
        this.uniforms.uCameraPosition.value = editor.activeDocument?.viewport3D
          .volumeSpaceCameraPosition ?? [0, 0, 0];
      }),
      autorun(() => {
        const coneTransferFunction =
          editor.activeDocument?.viewport3D.transferFunctions["fc-cone"];
        if (!coneTransferFunction) return;

        this.uniforms.uConeDirection.value = (coneTransferFunction as IConeTransferFunction).coneDirection.toArray();

        const shouldUpdateLighting =
          editor.activeDocument?.viewport3D.activeTransferFunction?.name ===
          "fc-cone";
        editor.activeDocument?.volumeRenderer?.lazyRender(shouldUpdateLighting);
      }),
      autorun(() => {
        const focusId = editor.activeDocument?.viewport3D.activeTransferFunction
          ?.params.annotation?.value as string | undefined;

        const isFocusSelected = Boolean(focusId);

        const isLayerVisibilityOverridden = Boolean(
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .useFocus,
        );

        const isFocusLayerVisible = focusId
          ? editor.activeDocument?.getLayer(focusId)?.isVisible
          : undefined;

        this.uniforms.uUseFocus.value =
          (isFocusSelected &&
            (isLayerVisibilityOverridden
              ? editor.activeDocument?.viewport3D.activeTransferFunction?.params
                  .useFocus?.value
              : isFocusLayerVisible)) ??
          false;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uFocusOpacity.value =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .focusOpacity?.value ?? 1;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const transferFunctionName =
          editor.activeDocument?.viewport3D.activeTransferFunction?.name;
        this.uniforms.uTransferFunction.value = transferFunctionName
          ? transferFunctionNameToId(transferFunctionName)
          : 0;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uOpacity.value =
          editor.activeDocument?.viewport3D.opacity ?? 1;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uContextOpacity.value =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .contextOpacity?.value ?? 1;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const rangeParameter =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .densityRange;

        [
          this.uniforms.uLimitLow.value,
          this.uniforms.uLimitHigh.value,
        ] = rangeParameter
          ? (rangeParameter as INumberRangeParameter).value
          : [0, 1];

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uConeAngle.value =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .coneAngle?.value ?? 1;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const shadingMode = editor.activeDocument?.viewport3D.shadingMode;

        this.uniforms.uLightingMode.value = shadingMode
          ? shadingModeNameToId(shadingMode)
          : 0;

        editor.activeDocument?.volumeRenderer?.lazyRender();
      }),
      autorun(() => {
        const brightness = editor.activeDocument?.viewSettings.brightness ?? 1;
        const factor =
          editor.activeDocument?.viewport3D.shadingMode === "lao"
            ? editor.activeDocument?.viewport3D.activeTransferFunction
                ?.laoBrightnessFactor ?? 1
            : 1;

        this.uniforms.uBrightness.value = brightness * factor;

        editor.activeDocument?.volumeRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uContrast.value =
          editor.activeDocument?.viewSettings.contrast ?? 1;

        editor.activeDocument?.volumeRenderer?.lazyRender();
      }),
      autorun(() => {
        const customTransferFunction =
          editor.activeDocument?.viewport3D.transferFunctions.custom;

        this.uniforms.uCustomTFTexture.value = customTransferFunction
          ? (customTransferFunction as ICustomTransferFunction).texture
          : null;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      reaction(
        () => {
          const imageId =
            editor.activeDocument?.viewport3D.activeTransferFunction?.params
              .image?.value;

          if (!imageId) return undefined;

          const imageLayer = editor.activeDocument?.getLayer(imageId as string);

          if (!imageLayer) return undefined;

          return [
            imageLayer as IImageLayer,
            imageLayer.color,
            editor.theme,
          ] as [IImageLayer, string | undefined, Theme];
        },
        (
          params?: [IImageLayer, string | undefined, Theme],
          previousParams?: [IImageLayer, string | undefined, Theme],
        ) => {
          if (!params) return editor.volumeRenderer?.lazyRender();

          const [imageLayer, imageColor, theme] = params;

          const image = imageLayer.image as RenderedImage;

          this.uniforms.uVolume.value = image.getTexture(0, THREE.LinearFilter);
          this.uniforms.uVoxelCount.value = image.voxelCount;
          this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
          this.uniforms.uStepSize.value = getStepSize(image);

          (this.uniforms.uContextColor.value as THREE.Color).set(
            color(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (imageColor as any) || "foreground",
            )({ theme }),
          );

          const previousImageLayer = previousParams
            ? previousParams[0]
            : undefined;
          const shouldUpdateLighting = imageLayer.id !== previousImageLayer?.id;

          editor.volumeRenderer?.lazyRender(shouldUpdateLighting);
        },
        { fireImmediately: true },
      ),
      reaction(
        () => {
          const imageId =
            editor.activeDocument?.viewport3D.activeTransferFunction?.params
              .annotation?.value;

          if (!imageId) return undefined;

          const imageLayer = editor.activeDocument?.getLayer(imageId as string);

          if (!imageLayer) return undefined;

          return [
            imageLayer as IImageLayer,
            imageLayer.color,
            editor.theme,
          ] as [IImageLayer, string | undefined, Theme];
        },
        (
          params?: [IImageLayer, string | undefined, Theme],
          previousParams?: [IImageLayer, string | undefined, Theme],
        ) => {
          if (params) {
            const [imageLayer, imageColor, theme] = params;

            this.uniforms.uFocus.value = (imageLayer.image as RenderedImage).getTexture(
              0,
              THREE.NearestFilter,
            );
            (this.uniforms.uFocusColor.value as THREE.Color).set(
              color(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (imageColor as any) || "foreground",
              )({ theme }),
            );

            const previousImageLayer = previousParams
              ? previousParams[0]
              : undefined;
            const shouldUpdateLighting =
              imageLayer.id !== previousImageLayer?.id;

            editor.volumeRenderer?.lazyRender(shouldUpdateLighting);
          } else {
            this.uniforms.uFocus.value = null;
            editor.activeDocument?.volumeRenderer?.lazyRender(true);
          }
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
