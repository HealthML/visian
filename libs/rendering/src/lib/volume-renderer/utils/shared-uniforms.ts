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
import { MAX_BLIP_STEPS } from "../../tool-renderer";
import {
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

  private workingVector1 = new THREE.Vector3();
  private workingVector2 = new THREE.Vector3();
  private workingColor = new THREE.Color();
  private readonly coneAxis = new THREE.Vector3(0, 1, 0);

  constructor(editor: IEditor) {
    this.uniforms = THREE.UniformsUtils.merge([
      opacityUniforms,
      commonUniforms,
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
        this.workingVector1
          .set(coneDirection.x, -coneDirection.y, coneDirection.z)
          .normalize();
        const cos = this.workingVector1.dot(this.coneAxis);
        const k = 1 / (1 + cos);

        this.workingVector1.cross(this.coneAxis);

        (this.uniforms.uConeMatrix.value as THREE.Matrix3).set(
          this.workingVector1.x * this.workingVector1.x * k + cos,
          this.workingVector1.x * this.workingVector1.y * k +
            this.workingVector1.z,
          this.workingVector1.x * this.workingVector1.z * k -
            this.workingVector1.y,
          this.workingVector1.y * this.workingVector1.x * k -
            this.workingVector1.z,
          this.workingVector1.y * this.workingVector1.y * k + cos,
          this.workingVector1.y * this.workingVector1.z * k +
            this.workingVector1.x,
          this.workingVector1.z * this.workingVector1.x * k +
            this.workingVector1.y,
          this.workingVector1.z * this.workingVector1.y * k -
            this.workingVector1.x,
          this.workingVector1.z * this.workingVector1.z * k + cos,
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

        [this.uniforms.uLimitLow.value, this.uniforms.uLimitHigh.value] =
          rangeParameter
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
          editor.activeDocument?.viewport3D.shadingMode === "lao" ? 3 : 1.25;

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
        this.uniforms.uUsePlane.value = Boolean(
          editor.activeDocument?.viewport3D.useClippingPlane,
        );

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uPlaneNormal.value =
          editor.activeDocument?.viewport3D.clippingPlaneNormal.toArray();

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uPlaneDistance.value =
          editor.activeDocument?.viewport3D.clippingPlaneDistance;

        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];

        const useNearestFilteringImage = Boolean(
          editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .useBlockyContext?.value,
        );
        const useNearestFilteringAnnotation =
          !editor.activeDocument?.viewport3D.useSmoothSegmentations;
        const layerData = layers.map((layer) =>
          layer ===
          editor.activeDocument?.tools.dilateErodeRenderer3D.targetLayer
            ? editor.activeDocument.tools.dilateErodeRenderer3D.outputTexture
            : ((layer as IImageLayer).image as RenderedImage).getTexture(
                (
                  layer.isAnnotation
                    ? useNearestFilteringAnnotation
                    : useNearestFilteringImage
                )
                  ? THREE.NearestFilter
                  : THREE.LinearFilter,
              ),
        );

        this.uniforms.uLayerData.value = [
          editor.activeDocument?.tools.layerPreviewTexture || null,
          ...layerData,
        ];

        const activeLayer = editor.activeDocument?.activeLayer;
        this.uniforms.uActiveLayerData.value = activeLayer
          ? ((activeLayer as IImageLayer).image as RenderedImage).getTexture(
              (
                activeLayer.isAnnotation
                  ? useNearestFilteringAnnotation
                  : useNearestFilteringImage
              )
                ? THREE.NearestFilter
                : THREE.LinearFilter,
            )
          : null;

        editor.activeDocument?.viewport3D.onTransferFunctionChange();
        editor.activeDocument?.volumeRenderer?.lazyRender(true, true);
      }),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];

        const layerAnnotationStatuses = layers.map(
          (layer) => layer.isAnnotation,
        );

        this.uniforms.uLayerAnnotationStatuses.value = [
          // additional layer for 3d region growing
          true,
          ...layerAnnotationStatuses,
        ];

        const opacityFactor =
          (editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .contextOpacity?.value as number | undefined) ?? 1;
        const layerOpacities = layers.map((layer) =>
          layer.isVisible
            ? layer.isAnnotation
              ? layer.opacity
              : layer.opacity * opacityFactor
            : 0,
        );

        const activeLayer = editor.activeDocument?.activeLayer;
        this.uniforms.uLayerOpacities.value = [
          // additional layer for 3d region growing
          activeLayer?.isVisible ? activeLayer.opacity : 0,
          ...layerOpacities,
        ];

        editor.activeDocument?.viewport3D.onTransferFunctionChange();
        editor.activeDocument?.volumeRenderer?.lazyRender(true, true);
      }),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];

        const layerColors = layers.map(
          (layer) =>
            new THREE.Color(
              color(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (layer.color as any) || "foreground",
              )({ theme: editor.theme }),
            ),
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let previewColor: any = "foreground";
        const tools = editor.activeDocument?.tools;
        if (tools?.regionGrowingRenderer3D.holdsPreview) {
          previewColor = tools.regionGrowingRenderer3D.previewColor;
        }
        if (tools?.samRenderer.holdsPreview) {
          previewColor = tools.samRenderer.previewColor;
        }
        if (tools?.thresholdAnnotationRenderer3D.holdsPreview) {
          previewColor = tools.thresholdAnnotationRenderer3D.previewColor;
        }

        this.uniforms.uLayerColors.value = [
          // additional layer for 3d region growing
          new THREE.Color(color(previewColor)({ theme: editor.theme })),
          ...layerColors,
        ];

        editor.activeDocument?.volumeRenderer?.lazyRender();
      }),
      autorun(() => {
        const visibleScanLayers =
          editor.activeDocument?.imageLayers.filter(
            (layer) => !layer.isAnnotation && layer.isVisible,
          ) || [];

        this.workingVector1.setScalar(0); // Used for mixing the color
        let alpha = 0;

        visibleScanLayers.forEach((layer) => {
          this.workingColor.set(
            color(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (layer.color as any) || "foreground",
            )({ theme: editor.theme }),
          );
          this.workingVector2 // Used for adding to the mixed color
            .fromArray(this.workingColor.toArray());

          this.workingVector1.addScaledVector(
            this.workingVector2,
            (1 - alpha) * layer.opacity,
          );

          alpha += (1 - alpha) * layer.opacity;
        });

        const opacity =
          (editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .contextOpacity?.value as number | undefined) ?? 1;

        this.uniforms.uEdgeColor.value = [
          ...this.workingVector1.toArray(),
          opacity,
        ];

        editor.activeDocument?.viewport3D.onTransferFunctionChange();
        editor.activeDocument?.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        const imageLayer = editor.activeDocument?.mainImageLayer;
        if (!imageLayer) return;

        const image = imageLayer.image as RenderedImage;

        this.uniforms.uVoxelCount.value = image.voxelCount;
        this.uniforms.uStepSize.value = getStepSize(image);

        editor.activeDocument?.volumeRenderer?.lazyRender();
      }),
      autorun(() => {
        const steps =
          editor.activeDocument?.tools.regionGrowingRenderer3D.steps ?? 0;

        this.uniforms.uRegionGrowingThreshold.value =
          (MAX_BLIP_STEPS + 1 - steps) / (MAX_BLIP_STEPS + 1);

        editor.activeDocument?.viewport3D.onTransferFunctionChange();
        editor.volumeRenderer?.lazyRender(true);
      }),
      autorun(() => {
        this.uniforms.uUseExclusiveSegmentations.value =
          editor.activeDocument?.useExclusiveSegmentations;

        editor.activeDocument?.viewport3D.onTransferFunctionChange();
        editor.volumeRenderer?.lazyRender(true);
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
