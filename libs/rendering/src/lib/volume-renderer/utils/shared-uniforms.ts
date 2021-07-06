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

  private workingVector = new THREE.Vector3();
  private readonly coneAxis = new THREE.Vector3(0, 1, 0);

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

        const { coneDirection } = coneTransferFunction as IConeTransferFunction;

        // TODO: Why does y have to be flipped here?
        this.workingVector
          .set(coneDirection.x, -coneDirection.y, coneDirection.z)
          .normalize();
        const cos = this.workingVector.dot(this.coneAxis);
        const k = 1 / (1 + cos);

        this.workingVector.cross(this.coneAxis);

        (this.uniforms.uConeMatrix.value as THREE.Matrix3).set(
          this.workingVector.x * this.workingVector.x * k + cos,
          this.workingVector.x * this.workingVector.y * k +
            this.workingVector.z,
          this.workingVector.x * this.workingVector.z * k -
            this.workingVector.y,
          this.workingVector.y * this.workingVector.x * k -
            this.workingVector.z,
          this.workingVector.y * this.workingVector.y * k + cos,
          this.workingVector.y * this.workingVector.z * k +
            this.workingVector.x,
          this.workingVector.z * this.workingVector.x * k +
            this.workingVector.y,
          this.workingVector.z * this.workingVector.y * k -
            this.workingVector.x,
          this.workingVector.z * this.workingVector.z * k + cos,
        );

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
        const layerId =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .annotation?.value;

        const focusOpacity = layerId
          ? editor.activeDocument?.getLayer(layerId as string)?.opacity ?? 1
          : 1;

        this.uniforms.uFocusOpacity.value = focusOpacity;

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
        const layerId =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params.image
            ?.value;

        const contextOpacity = layerId
          ? editor.activeDocument?.getLayer(layerId as string)?.opacity ?? 1
          : 1;

        const opacityFactor =
          (editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .contextOpacity?.value as number | undefined) ?? 1;
        this.uniforms.uContextOpacity.value = contextOpacity * opacityFactor;

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
      autorun(() => {
        this.uniforms.uVolumeNearestFiltering.value = Boolean(
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .useBlockyContext?.value,
        );

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uUsePlane.value = Boolean(
          editor.activeDocument?.viewport3D.useCuttingPlane,
        );

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uPlaneNormal.value = editor.activeDocument?.viewport3D.cuttingPlaneNormal.toArray();

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uPlaneDistance.value =
          editor.activeDocument?.viewport3D.cuttingPlaneDistance;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const useNearestFiltering = Boolean(
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .useBlockyContext?.value,
        );

        const layers = (editor.activeDocument?.layers.filter(
          (layer) => layer.kind === "image",
        ) || []) as IImageLayer[];
        this.uniforms.uLayerData.value = layers.map((layer) =>
          ((layer as IImageLayer).image as RenderedImage).getTexture(
            0,
            useNearestFiltering ? THREE.NearestFilter : THREE.LinearFilter,
          ),
        );
        this.uniforms.uLayerAnnotationStatuses.value = layers.map(
          (layer) => layer.isAnnotation,
        );
        this.uniforms.uLayerOpacities.value = layers.map((layer) =>
          layer.isVisible ? layer.opacity : 0,
        );
        this.uniforms.uLayerColors.value = layers.map(
          (layer) =>
            new THREE.Color(
              color(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (layer.color as any) || "foreground",
              )({ theme: editor.theme }),
            ),
        );
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

          const baseImage = imageLayer.image as RenderedImage;

          this.uniforms.uVoxelCount.value = baseImage.voxelCount;
          this.uniforms.uAtlasGrid.value = baseImage.getAtlasGrid();
          this.uniforms.uStepSize.value = getStepSize(baseImage);

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
