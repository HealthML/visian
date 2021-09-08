import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

import {
  composeLayeredShader,
  volumeFragmentShader,
  volumeVertexShader,
} from "../shaders";
import { getMaxSteps, SharedUniforms } from "./utils";

/** A volume domain material. */
export class VolumeMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
  private disposers: IDisposer[] = [];

  constructor(
    editor: IEditor,
    sharedUniforms: SharedUniforms,
    firstDerivative: THREE.Texture,
    secondDerivative: THREE.Texture,
    outputDerivative: THREE.Texture,
    lao: THREE.Texture,
  ) {
    super({
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
      uniforms: {
        ...sharedUniforms.uniforms,
        uOutputFirstDerivative: { value: null },
        uLAO: { value: null },
        uUseRayDithering: { value: true },
        uDepthPass: { value: null },
        uDepthSize: { value: [1, 1] },
        uCameraNear: { value: 0 },
        uCameraFar: { value: 1 },
      },
      defines: {
        MAX_STEPS: 600,
      },
      transparent: true,
      depthTest: true,
    });

    // Always render the back faces.
    this.side = THREE.BackSide;

    this.uniforms.uInputFirstDerivative.value = firstDerivative;
    this.uniforms.uInputSecondDerivative.value = secondDerivative;
    this.uniforms.uOutputFirstDerivative.value = outputDerivative;
    this.uniforms.uLAO.value = lao;

    this.disposers.push(
      reaction(
        () => editor.volumeRenderer?.renderedImageLayerCount || 1,
        (layerCount: number) => {
          this.fragmentShader = composeLayeredShader(
            volumeFragmentShader,
            layerCount,
          );
          this.needsUpdate = true;
        },
        { fireImmediately: true },
      ),
      autorun(() => {
        const baseImage = editor.activeDocument?.baseImageLayer?.image;
        if (baseImage) {
          this.defines.MAX_STEPS = getMaxSteps(baseImage);
        }
        this.needsUpdate = true;
      }),
    );
  }

  public setVolumetricOcclusion(value: boolean) {
    this.depthTest = !value;
    if (value) {
      this.defines.VOLUMETRIC_OCCLUSION = "";
    } else {
      delete this.defines.VOLUMETRIC_OCCLUSION;
    }
    this.needsUpdate = true;
  }

  public setUseRayDithering(value: boolean) {
    this.uniforms.uUseRayDithering.value = value;
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export class VolumePickingMaterial extends VolumeMaterial {
  constructor(
    editor: IEditor,
    sharedUniforms: SharedUniforms,
    firstDerivative: THREE.Texture,
    secondDerivative: THREE.Texture,
    outputDerivative: THREE.Texture,
    lao: THREE.Texture,
  ) {
    super(
      editor,
      sharedUniforms,
      firstDerivative,
      secondDerivative,
      outputDerivative,
      lao,
    );

    this.defines.VOXEL_PICKING = "";
  }
}
