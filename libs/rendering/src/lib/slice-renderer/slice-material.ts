/* eslint-disable @typescript-eslint/no-explicit-any */
import { color, IEditor, IImageLayer } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import {
  composeLayeredShader,
  sliceFragmentShader,
  sliceVertexShader,
} from "../shaders";
import { MAX_REGION_GROWING_STEPS } from "../tool-renderer";
import { getOrder } from "./utils";

export class SliceMaterial extends THREE.ShaderMaterial implements IDisposable {
  protected disposers: IDisposer[] = [];

  constructor(private editor: IEditor, private viewType: ViewType) {
    super({
      vertexShader: sliceVertexShader,
      fragmentShader: sliceFragmentShader,
      uniforms: {
        uLayerData: { value: [] },
        uLayerAnnotationStatuses: { value: [] },
        uLayerOpacities: { value: [] },
        uLayerColors: { value: [] },
        uActiveSlices: { value: [0, 0, 0] },
        uVoxelCount: { value: [1, 1, 1] },
        uAtlasGrid: { value: [1, 1] },
        uContrast: { value: editor.activeDocument?.viewSettings.contrast },
        uBrightness: { value: editor.activeDocument?.viewSettings.brightness },
        uComponents: { value: 1 },
        uPreviewThreshold: { value: 0 },
      },
      transparent: true,
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
      autorun(() => {
        const imageLayer = editor.activeDocument?.baseImageLayer;
        if (!imageLayer) return;

        const image = imageLayer.image as RenderedImage;

        this.uniforms.uVoxelCount.value = image.voxelCount;
        this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
        this.uniforms.uComponents.value = image.voxelComponents;

        console.log(this.uniforms.uComponents.value);

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

        this.uniforms.uPreviewThreshold.value =
          (MAX_REGION_GROWING_STEPS + 1 - steps) /
          (MAX_REGION_GROWING_STEPS + 1);
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];
        const canvasIndex = getOrder(
          this.editor.activeDocument?.viewport2D.mainViewType ??
            ViewType.Transverse,
        ).indexOf(this.viewType);

        const layerData = layers.map((layer) =>
          ((layer as IImageLayer).image as RenderedImage).getTexture(
            canvasIndex,
          ),
        );

        this.uniforms.uLayerData.value = [
          // additional layer for 3d region growing
          editor.activeDocument?.tools.layerPreviewTextures[canvasIndex] ||
            null,
          ...layerData,
        ];

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
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
