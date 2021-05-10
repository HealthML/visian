import * as THREE from "three";

import { TiledRenderer, RenderParams } from "./tiled-renderer";

export class ResolutionComputer extends TiledRenderer {
  private _fullResolutionFlushed = false;

  private currentResolutionStep = 0;

  private targetSize: THREE.Vector2;

  constructor(
    subject: THREE.Material | RenderParams,
    renderer: THREE.WebGLRenderer,
    size: THREE.Vector2,
    private flush: () => void,
    private resolutionSteps = 2,
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
    this.setRenderGrid(2 ** this.currentResolutionStep);

    this.workingVector
      .copy(this.targetSize)
      .divideScalar(this.currentResolutionReduction)
      .ceil();

    super.setSize(this.workingVector.x, this.workingVector.y);
  }

  private get currentResolutionReduction() {
    return 2 ** (this.resolutionSteps - this.currentResolutionStep - 1);
  }
}
