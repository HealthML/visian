import * as THREE from "three";

import { IDisposable } from "../../types";

export class ResolutionComputer implements IDisposable {
  private workingVector = new THREE.Vector2();

  private intermediateRenderTarget: THREE.WebGLRenderTarget;

  private fullResolutionFlushed = false;

  private currentResolutionStep = 0;
  private subScreenSpaceId = 0;

  private resolutionScene = new THREE.Scene();
  private resolutionQuad: THREE.Mesh;
  private resolutionCamera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 10);

  constructor(
    private renderer: THREE.WebGLRenderer,
    private inputScene: THREE.Scene,
    private inputCamera: THREE.PerspectiveCamera,
    private targetSize: THREE.Vector2,
    private flush: () => void,
    private resolutionSteps = 2,
    private outputRenderTarget = new THREE.WebGLRenderTarget(1, 1),
  ) {
    this.resizeOutput();

    this.intermediateRenderTarget = new THREE.WebGLRenderTarget(
      Math.ceil(targetSize.x / Math.pow(2, resolutionSteps - 1)),
      Math.ceil(targetSize.y / Math.pow(2, resolutionSteps - 1)),
    );

    const geometry = new THREE.PlaneGeometry();
    geometry.translate(0.5, 0.5, 0);
    const material = new THREE.MeshBasicMaterial({
      map: this.intermediateRenderTarget.texture,
    });
    this.resolutionQuad = new THREE.Mesh(geometry, material);
    this.resolutionScene.add(this.resolutionQuad);
  }

  public get outputTexture() {
    return this.outputRenderTarget.texture;
  }

  public setTargetSize(width: number, height: number) {
    this.targetSize.set(width, height);

    this.resizeIntermediate();

    this.restart();
  }

  public restart() {
    this.fullResolutionFlushed = false;

    this.currentResolutionStep = 0;
    this.subScreenSpaceId = 0;

    this.resizeOutput();
  }

  public tick() {
    if (this.fullResolutionFlushed) return;

    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.intermediateRenderTarget);

    const resolutionGridSize = Math.pow(2, this.currentResolutionStep);

    // Set the view offset to the desired sub screen space.
    const offsetX = this.subScreenSpaceId % resolutionGridSize;
    const offsetY = Math.floor(this.subScreenSpaceId / resolutionGridSize);

    this.workingVector.copy(this.targetSize).divideScalar(resolutionGridSize);
    this.inputCamera.setViewOffset(
      this.targetSize.x,
      this.targetSize.y,
      offsetX * this.workingVector.x,
      offsetY * this.workingVector.y,
      this.workingVector.x,
      this.workingVector.y,
    );

    this.renderer.render(this.inputScene, this.inputCamera);

    this.inputCamera.clearViewOffset();

    this.renderer.setRenderTarget(this.outputRenderTarget);

    const previousAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;

    // Position resolution quad.
    const subScreenSpaceOffset = 1 / resolutionGridSize;
    this.resolutionQuad.position.set(
      offsetX * subScreenSpaceOffset,
      1 - (offsetY + 1) * subScreenSpaceOffset,
      0,
    );
    this.resolutionQuad.scale.set(
      subScreenSpaceOffset,
      subScreenSpaceOffset,
      1,
    );

    this.renderer.render(this.resolutionScene, this.resolutionCamera);

    this.renderer.autoClear = previousAutoClear;
    this.renderer.setRenderTarget(previousRenderTarget);

    this.subScreenSpaceId++;

    if (this.subScreenSpaceId >= Math.pow(resolutionGridSize, 2)) {
      this.flush();

      if (this.currentResolutionReduction <= 1) {
        this.fullResolutionFlushed = true;
      } else {
        this.currentResolutionStep++;
        this.subScreenSpaceId = 0;
        this.resizeOutput();
      }
    }
  }

  public dispose() {
    this.outputRenderTarget.dispose();
  }

  private resizeOutput() {
    this.workingVector
      .copy(this.targetSize)
      .divideScalar(this.currentResolutionReduction)
      .ceil();

    this.outputRenderTarget.setSize(this.workingVector.x, this.workingVector.y);
  }

  private resizeIntermediate() {
    this.intermediateRenderTarget.setSize(
      Math.ceil(this.targetSize.x / Math.pow(2, this.resolutionSteps - 1)),
      Math.ceil(this.targetSize.y / Math.pow(2, this.resolutionSteps - 1)),
    );
  }

  private get currentResolutionReduction() {
    return Math.pow(2, this.resolutionSteps - this.currentResolutionStep - 1);
  }
}
