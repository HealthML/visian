import { IDisposable, ScreenAlignedQuad } from "@visian/utils";
import * as THREE from "three";

import { RenderParams, RenderSubject } from "./types";

export class ProgressiveRenderer implements IDisposable {
  private renderParams: RenderParams;

  private intermediatRenderTarget = new THREE.WebGLRenderTarget(1, 1);

  private copyQuad: THREE.Mesh;
  private copyScene = new THREE.Scene();
  private copyCamera: THREE.OrthographicCamera;

  private quadId = 0;

  protected workingVector = new THREE.Vector2();

  constructor(
    subject: RenderSubject,
    protected renderer: THREE.WebGLRenderer,
    public readonly size = new THREE.Vector2(1, 1),
    protected target: THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(
      size.x,
      size.y,
    ),
    public readonly grid = new THREE.Vector2(1, 1),
    protected onFrameFinished?: () => void,
  ) {
    this.renderParams =
      subject instanceof THREE.Material
        ? new ScreenAlignedQuad(subject)
        : subject;

    this.resizeIntermediate();
    this.target.setSize(size.x, size.y);

    this.copyQuad = new THREE.Mesh(
      new THREE.PlaneBufferGeometry().translate(0.5, -0.5, 0).scale(1, -1, 1),
      new THREE.MeshBasicMaterial({
        map: this.intermediatRenderTarget.texture,
      }),
    );
    this.copyScene.add(this.copyQuad);

    this.copyCamera = new THREE.OrthographicCamera(
      0,
      this.grid.x,
      0,
      this.grid.y,
      0,
    );
  }

  public dispose() {
    this.intermediatRenderTarget.dispose();
    this.target.dispose();
    this.copyQuad.geometry.dispose();
    (this.copyQuad.material as THREE.MeshBasicMaterial).dispose();
    if (this.renderParams instanceof ScreenAlignedQuad) {
      this.renderParams.dispose();
    }
  }

  public get output() {
    return this.target.texture;
  }

  public setRenderGrid(x = 1, y = x) {
    this.grid.set(x, y);

    this.copyCamera.right = x;
    this.copyCamera.bottom = y;
    this.copyCamera.updateProjectionMatrix();

    this.resizeIntermediate();
  }

  public tick(target = this.target) {
    if (!this.isFrameFinished) {
      this.render(target);
    }
  }

  private render(target = this.target) {
    const { camera, scene } = this.renderParams;

    if (this.grid.equals(this.workingVector.setScalar(1))) {
      // Render direct frame.
      this.renderer.setRenderTarget(target);
      this.renderer.render(scene, camera);
      this.renderer.setRenderTarget(null);

      this.quadId++;

      if (this.onFrameFinished) this.onFrameFinished();

      return;
    }

    // Render subject.
    this.renderer.setRenderTarget(this.intermediatRenderTarget);

    const gridPositionX = this.quadId % this.grid.x;
    const gridPositionY = Math.floor(this.quadId / this.grid.x);

    const { width, height } = this.intermediatRenderTarget;
    camera.setViewOffset(
      this.size.x,
      this.size.y,
      width * gridPositionX,
      height * gridPositionY,
      width,
      height,
    );

    this.renderer.render(scene, camera);
    camera.clearViewOffset();

    // Copy subject
    this.copyQuad.position.set(gridPositionX, gridPositionY, 0);

    this.renderer.setRenderTarget(target);
    this.renderer.autoClear = false;

    this.renderer.render(this.copyScene, this.copyCamera);

    this.renderer.autoClear = true;
    this.renderer.setRenderTarget(null);

    this.quadId++;
    if (this.isFrameFinished && this.onFrameFinished) {
      this.onFrameFinished();
    }
  }

  public get isFrameFinished() {
    return this.quadId >= this.grid.x * this.grid.y;
  }

  public setSize(width: number, height: number) {
    this.size.set(width, height);

    this.resizeIntermediate();

    this.target.setSize(width, height);
  }

  private resizeIntermediate() {
    this.workingVector.copy(this.size).divide(this.grid).ceil();

    this.intermediatRenderTarget.setSize(
      this.workingVector.x,
      this.workingVector.y,
    );
  }

  public restartFrame() {
    this.quadId = 0;
  }
}
