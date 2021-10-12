import { IEditor, IImageLayer } from "@visian/ui-shared";
import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";

import { SharedUniforms } from "../shared-uniforms";
import { TiledRenderer } from "../tiled-renderer";
import { getTotalLAODirections } from "./lao-directions";
import LAOMaterial from "./lao-material";

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
      autorun(() => {
        const imageLayer = editor.activeDocument?.baseImageLayer as
          | IImageLayer
          | undefined;
        if (!imageLayer) return;

        const atlasSize = imageLayer.image.getAtlasSize();

        this.setSize(atlasSize.x, atlasSize.y);

        const quadSize = editor.performanceMode === "low" ? 256 : 1024;

        this.setRenderGrid(
          Math.ceil(atlasSize.x / quadSize),
          Math.ceil(atlasSize.y / quadSize),
        );

        this.setDirty();
      }),
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

    const totalLAORays = getTotalLAODirections(this.editor.performanceMode);

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
