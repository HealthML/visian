import {
  color,
  IConeTransferFunction,
  ICustomTransferFunction,
  IEditor,
  IImageLayer,
  INumberRangeParameter,
} from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../../rendered-image";
import {
  atlasInfoUniforms,
  commonUniforms,
  imageInfoUniforms,
  lightingUniforms,
  opacityUniforms,
  transferFunctionsUniforms,
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
        this.uniforms.uUseFocus.value =
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .useFocus?.value ?? true;

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
        const layers = (editor.activeDocument?.layers.filter(
          (layer) => layer.kind === "image",
        ) || []) as IImageLayer[];

        const useNearestFiltering = Boolean(
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .useBlockyContext?.value,
        );
        this.uniforms.uLayerData.value = layers.map((layer) =>
          ((layer as IImageLayer).image as RenderedImage).getTexture(
            0,
            useNearestFiltering ? THREE.NearestFilter : THREE.LinearFilter,
          ),
        );

        editor.activeDocument?.viewport3D.onTransferFunctionChange();
        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const layers = (editor.activeDocument?.layers.filter(
          (layer) => layer.kind === "image",
        ) || []) as IImageLayer[];

        this.uniforms.uLayerAnnotationStatuses.value = layers.map(
          (layer) => layer.isAnnotation,
        );
        const opacityFactor =
          (editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .contextOpacity?.value as number | undefined) ?? 1;
        this.uniforms.uLayerOpacities.value = layers.map((layer) =>
          layer.isVisible
            ? layer.isAnnotation
              ? layer.opacity
              : layer.opacity * opacityFactor
            : 0,
        );

        editor.activeDocument?.viewport3D.onTransferFunctionChange();
        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const layers = (editor.activeDocument?.layers.filter(
          (layer) => layer.kind === "image",
        ) || []) as IImageLayer[];

        this.uniforms.uLayerColors.value = layers.map(
          (layer) =>
            new THREE.Color(
              color(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (layer.color as any) || "foreground",
              )({ theme: editor.theme }),
            ),
        );

        editor.activeDocument?.volumeRenderer?.lazyRender();
      }),
      autorun(() => {
        const imageLayer = editor.activeDocument?.layers.find(
          (layer) => layer.kind === "image",
        );
        if (!imageLayer) return;

        const image = (imageLayer as IImageLayer).image as RenderedImage;

        this.uniforms.uVoxelCount.value = image.voxelCount;
        this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
        this.uniforms.uStepSize.value = getStepSize(image);

        editor.activeDocument?.volumeRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
