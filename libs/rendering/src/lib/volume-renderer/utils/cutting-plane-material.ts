import { IEditor, IImageLayer, ILayerParameter } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";
import { RenderedImage } from "../../rendered-image";
import {
  cuttingPlaneFragmentShader,
  cuttingPlaneVertexShader,
} from "../../shaders";

export class CuttingPlaneMaterial extends THREE.ShaderMaterial {
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super({
      vertexShader: cuttingPlaneVertexShader,
      fragmentShader: cuttingPlaneFragmentShader,
      uniforms: {
        uAtlasGrid: { value: [1, 1] },
        uVoxelCount: { value: [1, 1, 1] },
        uDataTexture: { value: null },
      },
      transparent: true,
    });

    this.disposers.push(
      reaction(
        () =>
          (editor.activeDocument?.viewport3D.activeTransferFunction?.params
            .image as ILayerParameter | undefined)?.value,
        (layerId?: string) => {
          if (!layerId) return this.setImage();

          const layer = editor.activeDocument?.getLayer(layerId);
          if (!layer || layer.kind !== "image") return this.setImage();

          this.setImage((layer as IImageLayer).image as RenderedImage);
        },
      ),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  private setImage(image?: RenderedImage) {
    this.uniforms.uDataTexture.value =
      image?.getTexture(0, THREE.NearestFilter) ?? null;
    this.uniforms.uAtlasGrid.value = image?.getAtlasGrid().toArray() ?? [1, 1];
    this.uniforms.uVoxelCount.value = image?.voxelCount.toArray() ?? [1, 1, 1];
  }
}
