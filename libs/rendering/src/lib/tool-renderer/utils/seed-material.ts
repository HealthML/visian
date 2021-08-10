import { IDocument, IImageLayer } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { reaction } from "mobx";
import * as THREE from "three";
import { voxelFragmentShader, voxelVertexShader } from "../../shaders";

export class SeedMaterial extends THREE.ShaderMaterial {
  private disposers: IDisposer[] = [];

  constructor(document: IDocument) {
    super({
      vertexShader: voxelVertexShader,
      fragmentShader: voxelFragmentShader,
      uniforms: {
        uAtlasGrid: { value: [1, 1] },
        uVoxelCount: { value: [1, 1, 1] },
      },
    });

    this.disposers.push(
      reaction(
        () => document.activeLayer,
        (layer) => {
          if (layer?.kind !== "image") return;

          const { image } = layer as IImageLayer;

          this.uniforms.uAtlasGrid.value = image.getAtlasGrid().toArray();
          this.uniforms.uVoxelCount.value = image.voxelCount.toArray();
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
