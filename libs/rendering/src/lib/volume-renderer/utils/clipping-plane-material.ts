import { IEditor, IImageLayer } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../../rendered-image";
import {
  clippingPlaneFragmentShader,
  clippingPlaneVertexShader,
  composeLayeredShader,
} from "../../shaders";
import { SharedUniforms } from "./shared-uniforms";

export class ClippingPlaneMaterial extends THREE.ShaderMaterial {
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor, sharedUniforms: SharedUniforms) {
    super({
      vertexShader: clippingPlaneVertexShader,
      fragmentShader: clippingPlaneFragmentShader,
      uniforms: {
        ...sharedUniforms.uniforms,
        uLayerData: { value: [] },
        uLayerOpacities: { value: [] },
      },
      transparent: true,
      side: THREE.DoubleSide,
      glslVersion: THREE.GLSL3,
    });

    this.disposers.push(
      reaction(
        () => editor.volumeRenderer?.renderedImageLayerCount || 1,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            clippingPlaneFragmentShader,
            layerCount,
          );
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];

        const layerData = layers.map((layer) =>
          ((layer as IImageLayer).image as RenderedImage).getTexture(),
        );

        this.uniforms.uLayerData.value = [
          editor.activeDocument?.tools.layerPreviewTexture || null,
          ...layerData,
        ];
      }),
      autorun(() => {
        const layers = editor.activeDocument?.imageLayers || [];

        const layerOpacities = layers.map((layer) =>
          layer.isVisible &&
          (!layer.isAnnotation ||
            editor.activeDocument?.viewport3D
              .shouldClippingPlaneShowAnnotations)
            ? layer.opacity
            : 0,
        );

        const activeLayer = editor.activeDocument?.activeLayer;
        this.uniforms.uLayerOpacities.value = [
          // additional layer for 3d region growing
          activeLayer?.isVisible ? activeLayer.opacity : 0,
          ...layerOpacities,
        ];

        editor.volumeRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export class ClippingPlanePickingMaterial extends ClippingPlaneMaterial {
  constructor(editor: IEditor, sharedUniforms: SharedUniforms) {
    super(editor, sharedUniforms);

    this.defines.VOXEL_PICKING = "";
  }
}
