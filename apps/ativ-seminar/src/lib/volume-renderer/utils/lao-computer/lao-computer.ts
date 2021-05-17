import { IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";

import { VolumeRendererModel } from "../../../../models";
import { TextureAtlas } from "../../../texture-atlas";
import { TiledRenderer } from "../tiled-renderer";
import LAOMaterial from "./lao-material";

// TODO: Tweak based on performance.
export const totalLAORays = 32; // Set to 8 to turn progressive LAO off.
// TODO: Tweak based on performance.
export const quadSize = 1024;

export class LAOComputer extends TiledRenderer {
  private _isDirty = true;

  private _isFinalLAOFlushed = false;

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
      reaction(() => volumeRendererModel.useFocusVolume, this.setDirty),
      reaction(() => volumeRendererModel.focusColor, this.setDirty),
      reaction(() => volumeRendererModel.imageOpacity, this.setDirty),
      reaction(() => volumeRendererModel.contextOpacity, this.setDirty),
      reaction(() => volumeRendererModel.rangeLimits, this.setDirty),
      reaction(() => volumeRendererModel.cutAwayConeAngle, this.setDirty),
      reaction(() => volumeRendererModel.customTFTexture, this.setDirty),
      reaction(() => volumeRendererModel.transferFunction.type, this.setDirty),
      reaction(
        () => volumeRendererModel.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

          this.setSize(atlas.atlasSize.x, atlas.atlasSize.y);

          this.setRenderGrid(
            Math.ceil(atlas.atlasSize.x / quadSize),
            Math.ceil(atlas.atlasSize.y / quadSize),
          );

          this.setDirty();
        },
      ),
      reaction(() => volumeRendererModel.focus, this.setDirty),
    );
  }

  public dispose() {
    super.dispose();
    this.reactionDisposers.forEach((disposer) => disposer());
    this.laoMaterial.dispose();
  }

  public get isDirty() {
    return this._isDirty;
  }

  /** Whther or not the final progressive LAO frame has been flushed. */
  public get isFinalLAOFlushed() {
    return this._isFinalLAOFlushed;
  }

  public tick() {
    if (this._isDirty) {
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
      this._isFinalLAOFlushed = true;
    }
  };

  private renderInitialFrame() {
    this.laoMaterial.setPreviousDirections(0);

    const previousGrid = this.grid.clone();
    this.setRenderGrid(1);
    this.restartFrame();
    super.tick();
    this.setRenderGrid(previousGrid.x, previousGrid.y);

    this._isDirty = false;
  }

  private setDirty = () => {
    this._isDirty = true;
    this._isFinalLAOFlushed = false;
  };

  public setCameraPosition(position: THREE.Vector3) {
    this.laoMaterial.setCameraPosition(position);

    if (
      this.volumeRendererModel.transferFunction.updateLAOOnCameraMove &&
      this.volumeRendererModel.isConeLinkedToCamera
    ) {
      this.setDirty();
    }
  }
}

export default LAOComputer;
