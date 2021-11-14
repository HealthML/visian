/* eslint-disable @typescript-eslint/no-explicit-any */
import { color, IEditor, IImageLayer, MergeFunction } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import {
  composeLayeredShader,
  sliceFragmentShader,
  sliceVertexShader,
} from "../shaders";
import { MAX_BLIP_STEPS } from "../tool-renderer";

export class SliceMaterial extends THREE.ShaderMaterial implements IDisposable {
  protected disposers: IDisposer[] = [];

  constructor(editor: IEditor, viewType: ViewType, backgroundBlend: boolean) {
    super({
      vertexShader: sliceVertexShader,
      fragmentShader: sliceFragmentShader,
      uniforms: {
        uLayerData0: { value: null },
        uLayerAnnotationStatuses: { value: [] },
        uLayerOpacities: { value: [] },
        uLayerColors: { value: [] },
        uActiveSlices: { value: [0, 0, 0] },
        uVoxelCount: { value: [1, 1, 1] },
        uContrast: { value: editor.activeDocument?.viewSettings.contrast },
        uBrightness: { value: editor.activeDocument?.viewSettings.brightness },
        uComponents: { value: 1 },
        uActiveLayerData: { value: null },
        uRegionGrowingThreshold: { value: 0 },
        uBackgroundColor: { value: new THREE.Color(0x0c0e1b) },
        uActiveLayerIndex: { value: 0 },
        uToolPreview: { value: null },
        uToolPreviewMerge: { value: MergeFunction.Add },
      },
      defines: { VOLUMETRIC_IMAGE: "" },
      glslVersion: THREE.GLSL3,
      transparent: !backgroundBlend,
      side: THREE.DoubleSide,
    });

    switch (viewType) {
      case ViewType.Transverse:
        this.defines.TRANSVERSE = "";
        break;
      case ViewType.Sagittal:
        this.defines.SAGITTAL = "";
        break;
      case ViewType.Coronal:
        this.defines.CORONAL = "";
        break;
    }

    if (backgroundBlend) {
      this.defines.BACKGROUND_BLEND = "";
    }

    this.disposers.push(
      reaction(
        () => editor.volumeRenderer?.renderedImageLayerCount || 1,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            sliceFragmentShader,
            layerCount,
          );
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
      reaction(
        () => Boolean(editor.activeDocument?.baseImageLayer?.is3DLayer),
        (is3D: boolean) => {
          if (is3D) {
            this.defines.VOLUMETRIC_IMAGE = "";
          } else {
            delete this.defines.VOLUMETRIC_IMAGE;
          }
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
      autorun(() => {
        const imageLayer = editor.activeDocument?.baseImageLayer;
        if (!imageLayer) return;

        const image = imageLayer.image as RenderedImage;

        this.uniforms.uVoxelCount.value = image.voxelCount;
        this.uniforms.uComponents.value = image.voxelComponents;

        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uActiveSlices.value = editor.activeDocument?.viewSettings.selectedVoxel.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uContrast.value =
          editor.activeDocument?.viewSettings.contrast;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uBrightness.value =
          editor.activeDocument?.viewSettings.brightness;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        const steps =
          editor.activeDocument?.tools.regionGrowingRenderer3D.steps ?? 0;

        this.uniforms.uRegionGrowingThreshold.value =
          (MAX_BLIP_STEPS + 1 - steps) / (MAX_BLIP_STEPS + 1);
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];

        const layerData = layers.map((layer) =>
          layer ===
          editor.activeDocument?.tools.dilateErodeRenderer3D.targetLayer
            ? editor.activeDocument.tools.dilateErodeRenderer3D
                .outputTextures[0]
            : ((layer as IImageLayer).image as RenderedImage).getTexture(0),
        );

        this.uniforms.uLayerData0.value =
          editor.activeDocument?.tools.layerPreviewTextures[0] || null;

        for (let i = 0; i < layerData.length; i++) {
          if (!this.uniforms[`uLayerData${i + 1}`]) {
            this.uniforms[`uLayerData${i + 1}`] = { value: null };
          }
          this.uniforms[`uLayerData${i + 1}`].value = layerData[i];
        }

        const activeLayer = editor.activeDocument?.activeLayer as
          | IImageLayer
          | undefined;
        this.uniforms.uActiveLayerData.value = activeLayer
          ? (activeLayer.image as RenderedImage).getTexture(0)
          : null;

        this.uniforms.uActiveLayerIndex.value = activeLayer
          ? layers.indexOf(activeLayer) + 1
          : 1;

        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uToolPreview.value =
          editor.activeDocument?.tools.slicePreviewTexture ?? null;

        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uToolPreviewMerge.value =
          editor.activeDocument?.tools.slicePreviewMergeFunction ??
          MergeFunction.Add;

        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];

        const layerAnnotationStatuses = layers.map(
          (layer) => layer.isAnnotation,
        );

        this.uniforms.uLayerAnnotationStatuses.value = [
          // additional layer for 3d region growing preview
          true,
          ...layerAnnotationStatuses,
        ];

        const layerOpacities = layers.map((layer) =>
          layer.isVisible ? layer.opacity : 0,
        );

        const activeLayer = editor.activeDocument?.activeLayer;
        this.uniforms.uLayerOpacities.value = [
          // additional layer for 3d region growing
          activeLayer?.isVisible ? activeLayer.opacity : 0,
          ...layerOpacities,
        ];

        editor.sliceRenderer?.lazyRender();
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

        this.uniforms.uLayerColors.value = [
          // additional layer for 3d region growing preview
          new THREE.Color(
            color(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (editor.activeDocument?.tools.regionGrowingRenderer3D
                .previewColor as any) || "foreground",
            )({ theme: editor.theme }),
          ),
          ...layerColors,
        ];

        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uBackgroundColor.value.set(
          color("background")({ theme: editor.theme }),
        );

        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
