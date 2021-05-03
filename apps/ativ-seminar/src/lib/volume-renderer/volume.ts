import { IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { IDisposable } from "../types";
import VolumeMaterial from "./volume-material";

import type VolumeRenderer from "./volume-renderer";

/** A volume domain. */
class Volume extends THREE.Mesh implements IDisposable {
  private disposers: IDisposer[] = [];
  constructor(volumeRenderer: VolumeRenderer, renderer: THREE.WebGLRenderer) {
    super(
      new THREE.BoxGeometry(1, 1, 1),
      new VolumeMaterial(volumeRenderer, renderer),
    );

    // The coordinate system in medical images usually has the object
    // laying on the side. We want it to be upright.
    this.rotateX(-Math.PI / 2);

    this.disposers.push(
      autorun(() => {
        const atlas = volumeRenderer.state.image;
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

  public tick() {
    (this.material as VolumeMaterial).tick();
  }

  public updateCameraPosition(camera: THREE.Camera) {
    (this.material as VolumeMaterial).updateCameraPosition(this, camera);
  }

  public dispose() {
    (this.material as VolumeMaterial).dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export default Volume;
