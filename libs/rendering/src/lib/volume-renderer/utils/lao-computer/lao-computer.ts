import { IEditor, IImageLayer, isPerformanceLow } from "@visian/ui-shared";
import { Image } from "@visian/utils";
import { IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";

import { SharedUniforms } from "../shared-uniforms";
import { TiledRenderer } from "../tiled-renderer";
import LAOMaterial from "./lao-material";

export const totalLAORays = isPerformanceLow ? 8 : 32; // Set to 8 to turn progressive LAO off.
export const quadSize = isPerformanceLow ? 512 : 1024;

export class LAOComputer extends TiledRenderer {
  private _isDirty = true;

  private _isFinalLAOFlushed = false;

  private reactionDisposers: IReactionDisposer[] = [];

  constructor(
    editor: IEditor,
    sharedUniforms: SharedUniforms,
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
    private flush: () => void,
    target = new THREE.WebGLRenderTarget(1, 1),
    private laoMaterial = new LAOMaterial(
      editor,
      firstDerivativeTexture,
      secondDerivativeTexture,
      target.texture,
      sharedUniforms,
    ),
  ) {
    super(laoMaterial, editor.renderers[0], undefined, target);

    this.reactionDisposers.push(
      reaction(
        () => {
          const imageId =
            editor.activeDocument?.viewport3D.activeTransferFunction?.params
              .image?.value;

          if (!imageId) return undefined;

          const imageLayer = editor.activeDocument?.getLayer(imageId as string);

          if (!imageLayer) return undefined;

          return (imageLayer as IImageLayer).image;
        },
        (image?: Image) => {
          if (!image) return;

          const atlasSize = image.getAtlasSize();

          this.setSize(atlasSize.x, atlasSize.y);

          this.setRenderGrid(
            Math.ceil(atlasSize.x / quadSize),
            Math.ceil(atlasSize.y / quadSize),
          );

          this.setDirty();
        },
      ),
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

  /** Whether or not the final progressive LAO frame has been flushed. */
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

  public setDirty = () => {
    this._isDirty = true;
    this._isFinalLAOFlushed = false;
  };
}

export default LAOComputer;
