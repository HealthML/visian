import { IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";

import { VolumeRendererModel } from "../../../../models";
import { TextureAtlas } from "../../../texture-atlas";
import { ProgressiveRenderer } from "../progressive-renderer";
import LAOMaterial from "./lao-material";

// TODO: Tweak based on performance.
export const totalLAORays = 32; // Set to 8 to turn progressive LAO off.
// TODO: Tweak based on performance.
export const quadSize = 1024;

export class LAOComputer extends ProgressiveRenderer {
  private _dirty = true;

  private _finalLAOFlushed = false;

  private reactionDisposers: IReactionDisposer[] = [];

  constructor(
    renderer: THREE.WebGLRenderer,
    private volumeRendererModel: VolumeRendererModel,
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
    private flush: () => void,
    target = new THREE.WebGLRenderTarget(1, 1),
    private laoMaterial = new LAOMaterial(
      firstDerivativeTexture,
      secondDerivativeTexture,
      target.texture,
      volumeRendererModel,
    ),
  ) {
    super(laoMaterial, renderer, undefined, target);

    this.reactionDisposers.push(
      reaction(() => volumeRendererModel.transferFunction.type, this.update),
      reaction(() => volumeRendererModel.imageOpacity, this.update),
      reaction(() => volumeRendererModel.contextOpacity, this.update),
      reaction(() => volumeRendererModel.rangeLimits, this.update),
      reaction(() => volumeRendererModel.cutAwayConeAngle, this.update),
      reaction(
        () => volumeRendererModel.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

          this.setSize(atlas.atlasSize.x, atlas.atlasSize.y);

          this.setRenderGrid(
            Math.ceil(atlas.atlasSize.x / quadSize),
            Math.ceil(atlas.atlasSize.y / quadSize),
          );

          this.update();
        },
      ),
      reaction(() => volumeRendererModel.focus, this.update),
    );
  }

  public dispose() {
    super.dispose();
    this.reactionDisposers.forEach((disposer) => disposer());
    this.laoMaterial.dispose();
  }

  public get dirty() {
    return this._dirty;
  }

  public get finalLAOFlushed() {
    return this._finalLAOFlushed;
  }

  public tick() {
    if (this._dirty) {
      this.renderInitialFrame();

      return;
    }

    super.tick();
  }

  protected onFrameFinished = () => {
    this.flush();

    this.laoMaterial.setPreviousDirections(
      this.laoMaterial.previousDirections + 8,
    );
    if (this.laoMaterial.previousDirections < totalLAORays) {
      this.restartFrame();
    } else {
      this._finalLAOFlushed = true;
    }
  };

  private renderInitialFrame() {
    this.laoMaterial.setPreviousDirections(0);

    const previousGrid = this.grid.clone();
    this.setRenderGrid(1);
    this.restartFrame();
    super.tick();
    this.setRenderGrid(previousGrid.x, previousGrid.y);

    this._dirty = false;
  }

  private update = () => {
    this._dirty = true;
    this._finalLAOFlushed = false;
  };

  public setCameraPosition(position: THREE.Vector3) {
    this.laoMaterial.setCameraPosition(position);

    if (this.volumeRendererModel.transferFunction.updateLAOOnCameraMove) {
      this.update();
    }
  }
}

export default LAOComputer;
