import { IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { IDisposable } from "../types";
import { SharedUniforms } from "./utils";
import VolumeMaterial from "./volume-material";

import type VolumeRenderer from "./volume-renderer";

/** A volume domain. */
class Volume extends THREE.Mesh implements IDisposable {
  private disposers: IDisposer[] = [];
  constructor(
    volumeRenderer: VolumeRenderer,
    sharedUniforms: SharedUniforms,
    firstDerivative: THREE.Texture,
    secondDerivative: THREE.Texture,
    outputDerivative: THREE.Texture,
    lao: THREE.Texture,
  ) {
    super(
      new THREE.BoxGeometry(1, 1, 1),
      new VolumeMaterial(
        volumeRenderer,
        sharedUniforms,
        firstDerivative,
        secondDerivative,
        outputDerivative,
        lao,
      ),
    );

    // The coordinate system in medical images usually has the object
    // laying on the side. We want it to be upright.
    this.rotateX(-Math.PI / 2);

    this.disposers.push(
      autorun(() => {
        const atlas = volumeRenderer.model.image;
        if (!atlas) return;
        this.scale.copy(
          atlas.voxelCount
            .clone()
            .multiply(atlas.voxelSpacing)
            .multiplyScalar(0.001),
        );
      }),
    );
  }

  public dispose() {
    (this.material as VolumeMaterial).dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export default Volume;
