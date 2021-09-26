import { IEditor, IImageLayer, isPerformanceLow } from "@visian/ui-shared";
import { Image } from "@visian/utils";
import { IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";

import { SharedUniforms } from "../shared-uniforms";
import { TiledRenderer } from "../tiled-renderer";
import LAOMaterial from "./lao-material";

export const totalLAORays = isPerformanceLow ? 8 : 32; // Set to 8 to turn progressive LAO off.
export const quadSize = isPerformanceLow ? 256 : 1024;

export class LAOComputer extends TiledRenderer {
  private _isDirty = true;

  private _isFinalLAOFlushed = false;
  private isFirstFrameStarted = false;

  private reactionDisposers: IReactionDisposer[] = [];

  constructor(
    private editor: IEditor,
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
          const imageLayer = editor.activeDocument?.baseImageLayer;
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
    if (this._isDirty && !this.isFirstFrameStarted) {
      this.laoMaterial.setPreviousDirections(0);
      this.restartFrame();
      this.isFirstFrameStarted = true;
    }

    super.tick();
  }

  protected onFrameFinished = () => {
    this._isDirty = false;

    this.flush();
    if (this.editor.activeDocument?.viewport3D.requestedShadingMode === "lao") {
      this.editor.activeDocument?.viewport3D.confirmRequestedShadingMode();
    }

    this.laoMaterial.setPreviousDirections(
      this.laoMaterial.previousDirections + 8,
    );
    if (this.laoMaterial.previousDirections < totalLAORays) {
      this.restartFrame();
    } else {
      this._isFinalLAOFlushed = true;
    }
  };

  public setDirty = () => {
    this._isDirty = true;
    this.isFirstFrameStarted = false;
    this._isFinalLAOFlushed = false;
  };
}

export default LAOComputer;
