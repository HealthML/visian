import * as THREE from "three";
import { ScreenAlignedQuad } from "../../screen-aligned-quad";
import { VolumeMaterial } from "../volume-material";
import { CopyMaterial } from "./copy-material";
import { ProgressiveAccumulationMaterial } from "./progressive-accumulation-material";
import { RenderParams, TiledRenderer } from "./tiled-renderer";

const ditheringOffsets = [
  0,
  0.5,
  0.3,
  0.1,
  0.4,
  0.2,
  0.8,
  0.6,
  0.9,
  0.7,
  0.05,
  0.55,
  0.35,
  0.15,
  0.45,
  0.25,
  0.85,
  0.65,
  0.95,
  0.75,
  0.025,
  0.525,
  0.325,
  0.125,
  0.425,
  0.225,
  0.825,
  0.625,
  0.925,
  0.725,
  0.075,
  0.575,
  0.375,
  0.175,
  0.475,
  0.275,
  0.875,
  0.675,
  0.975,
  0.775,
];

export class DitheringRenderer extends TiledRenderer {
  private _isFinished = false;

  private currentDitheringStep = 1;

  private accumulationTarget = new THREE.WebGLRenderTarget(1, 1);

  private accumulationMaterial: ProgressiveAccumulationMaterial;
  private accumulationQuad: ScreenAlignedQuad;

  private copyMaterial: CopyMaterial;
  private copyAccumulationQuad: ScreenAlignedQuad;

  constructor(
    subject: THREE.Material | RenderParams,
    renderer: THREE.WebGLRenderer,
    size: THREE.Vector2,
    private flush: () => void,
    private volumeMaterial: VolumeMaterial,
    private outputTarget: THREE.WebGLRenderTarget,
  ) {
    super(subject, renderer, size.clone());

    this.setRenderGrid(4);

    this.accumulationMaterial = new ProgressiveAccumulationMaterial(
      super.output,
      this.output,
    );
    this.accumulationQuad = new ScreenAlignedQuad(this.accumulationMaterial);

    this.copyMaterial = new CopyMaterial(this.accumulationTarget.texture);
    this.copyAccumulationQuad = new ScreenAlignedQuad(this.copyMaterial);
  }

  public dispose() {
    super.dispose();
    this.accumulationTarget.dispose();
    this.outputTarget.dispose();
    this.accumulationQuad.dispose();
    this.accumulationMaterial.dispose();
    this.copyAccumulationQuad.dispose();
    this.copyMaterial.dispose();
  }

  public get isFinished() {
    return this._isFinished;
  }

  public get output() {
    return this.outputTarget.texture;
  }

  public setSize(width: number, height: number): void {
    super.setSize(width, height);

    this.accumulationTarget.setSize(width, height);
    this.outputTarget.setSize(width, height);

    this.restart();
  }

  public restart() {
    this._isFinished = false;
    this.currentDitheringStep = 1; // Step 0 is the output from the resolution computer
    this.configureRendering();
    this.restartFrame();
  }

  protected onFrameFinished = () => {
    this.renderer.setRenderTarget(this.accumulationTarget);
    this.accumulationQuad.renderWith(this.renderer);
    this.renderer.setRenderTarget(this.outputTarget);
    this.copyAccumulationQuad.renderWith(this.renderer);
    this.renderer.setRenderTarget(null);

    this.flush();

    if (this.currentDitheringStep >= ditheringOffsets.length - 1) {
      this._isFinished = true;
    } else {
      this.currentDitheringStep++;
      this.configureRendering();
      super.restartFrame();
    }
  };

  private configureRendering() {
    this.volumeMaterial.setRayDitheringOffset(
      ditheringOffsets[this.currentDitheringStep],
    );
    this.accumulationMaterial.setAccumulationCount(this.currentDitheringStep);
  }
}
