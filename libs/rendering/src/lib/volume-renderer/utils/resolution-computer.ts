import { IEditor } from "@visian/ui-shared";
import * as THREE from "three";

import { RenderParams, TiledRenderer } from "./tiled-renderer";
import { VolumeMaterial } from "../volume-material";

export class ResolutionComputer extends TiledRenderer {
  private _fullResolutionFlushed = false;

  private currentResolutionStep = 0;

  private targetSize: THREE.Vector2;

  constructor(
    private editor: IEditor,
    subject: THREE.Material | RenderParams,
    renderer: THREE.WebGLRenderer,
    size: THREE.Vector2,
    private flush: () => void,
    private volumeMaterial: VolumeMaterial,
    target?: THREE.WebGLRenderTarget,
  ) {
    super(subject, renderer, size.clone(), target);

    this.targetSize = size;

    this.configureRendering();
  }

  public get fullResolutionFlushed() {
    return this._fullResolutionFlushed;
  }

  public setSize(width: number, height: number) {
    this.targetSize.set(width, height);

    this.restart();
  }

  public restart() {
    this.currentResolutionStep = 0;

    this.restartFrame();

    this.configureRendering();
  }

  public restartFrame() {
    super.restartFrame();

    this._fullResolutionFlushed = false;
  }

  protected onFrameFinished = () => {
    this.flush();

    if (this.currentResolutionReduction <= 1) {
      this._fullResolutionFlushed = true;
    } else {
      this.currentResolutionStep++;
      this.configureRendering();
      super.restartFrame();
    }
  };

  private configureRendering() {
    this.volumeMaterial.setRayDitheringOffset();

    this.setRenderGrid(2 ** this.currentResolutionStep);

    this.workingVector
      .copy(this.targetSize)
      .divideScalar(this.currentResolutionReduction)
      .ceil();

    super.setSize(this.workingVector.x, this.workingVector.y);
  }

  private get resolutionSteps() {
    return this.editor.performanceMode === "low" ? 4 : 3;
  }

  private get currentResolutionReduction() {
    return 2 ** (this.resolutionSteps - this.currentResolutionStep - 1);
  }
}
