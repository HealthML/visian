import {
  color,
  IConeTransferFunction,
  ICustomTransferFunction,
  IEditor,
  IImageLayer,
  INumberRangeParameter,
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
      }),
      autorun(() => {
        this.uniforms.uUseFocus.value =
          (editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .annotation?.value &&
            editor.activeDocument?.viewport3D.activeTransferFunction?.params
              .useFocus?.value) ??
          false;
      }),
      autorun(() => {
        this.uniforms.uFocusOpacity.value =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .focusOpacity?.value ?? 1;
      }),
      autorun(() => {
        const transferFunctionName =
          editor.activeDocument?.viewport3D.activeTransferFunction?.name;
        this.uniforms.uTransferFunction.value = transferFunctionName
          ? transferFunctionNameToId(transferFunctionName)
          : 0;
      }),
      autorun(() => {
        this.uniforms.uOpacity.value =
          editor.activeDocument?.viewport3D.opacity ?? 1;
      }),
      autorun(() => {
        this.uniforms.uContextOpacity.value =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .contextOpacity?.value ?? 1;
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
      }),
      autorun(() => {
        this.uniforms.uConeAngle.value =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .coneAngle?.value ?? 1;
      }),
      autorun(() => {
        const shadingMode = editor.activeDocument?.viewport3D.shadingMode;

        this.uniforms.uLightingMode.value = shadingMode
          ? shadingModeNameToId(shadingMode)
          : 0;
      }),
      autorun(() => {
        const brightness = editor.activeDocument?.viewSettings.brightness ?? 1;
        const factor =
          editor.activeDocument?.viewport3D.activeTransferFunction
            ?.laoBrightnessFactor ?? 1;

        this.uniforms.uLaoIntensity.value = brightness * factor;
      }),
      autorun(() => {
        const customTransferFunction =
          editor.activeDocument?.viewport3D.transferFunctions.custom;

        this.uniforms.uCustomTFTexture.value = customTransferFunction
          ? (customTransferFunction as ICustomTransferFunction).texture
          : null;
      }),
      reaction(
        () => {
          const imageId =
            editor.activeDocument?.viewport3D.activeTransferFunction?.params
              .image?.value;

          if (!imageId) return undefined;

          const imageLayer = editor.activeDocument?.getLayer(imageId as string);

          if (!imageLayer) return undefined;

          return (imageLayer as IImageLayer).image as RenderedImage;
        },
        (image?: RenderedImage) => {
          if (!image) return;

          this.uniforms.uVolume.value = image.getTexture(0, THREE.LinearFilter);
          this.uniforms.uVoxelCount.value = image.voxelCount;
          this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
          this.uniforms.uStepSize.value = getStepSize(image);
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

          return imageLayer as IImageLayer;
        },
        (imageLayer?: IImageLayer) => {
          if (imageLayer) {
            this.uniforms.uFocus.value = (imageLayer.image as RenderedImage).getTexture(
              0,
              THREE.LinearFilter,
            );
            (this.uniforms.uFocusColor.value as THREE.Color).set(
              color(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (imageLayer.color as any) || "foreground",
              )({
                theme: editor.theme,
              }),
            );
          } else {
            this.uniforms.uFocus.value = null;
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
