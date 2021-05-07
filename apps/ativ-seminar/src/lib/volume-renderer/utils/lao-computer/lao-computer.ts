import { ScreenAlignedQuad } from "@visian/utils";
import { IReactionDisposer, reaction } from "mobx";
import * as THREE from "three";

import { TextureAtlas } from "../../../texture-atlas";
import { IDisposable } from "../../../types";
import VolumeRenderer from "../../volume-renderer";
import LAOMaterial from "./lao-material";

// TODO: Tweak based on performance.
export const totalLAORays = 32; // Set to 8 to turn progressive LAO off.
// TODO: Tweak based on performance.
export const quadSize = 1024;

export class LAOComputer implements IDisposable {
  private outputRenderTarget: THREE.WebGLRenderTarget;
  public intermediateRenderTarget: THREE.WebGLRenderTarget;

  private laoMaterial: LAOMaterial;

  private computationQuad: ScreenAlignedQuad;

  private dirty = true;
  private needsCopy = false;

  private reactionDisposers: IReactionDisposer[] = [];

  private directFrames = true;
  private quadGrid = new THREE.Vector2();
  private quadCount = 0;
  private currentQuadId = 0;

  private copyScene = new THREE.Scene();
  private copyQuad: THREE.Mesh;
  private copyCamera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 10);

  constructor(
    private renderer: THREE.WebGLRenderer,
    private volumeRenderer: VolumeRenderer,
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
  ) {
    this.outputRenderTarget = new THREE.WebGLRenderTarget(1, 1);
    this.intermediateRenderTarget = new THREE.WebGLRenderTarget(1, 1);

    this.laoMaterial = new LAOMaterial(
      firstDerivativeTexture,
      secondDerivativeTexture,
      this.getLAOTexture(),
      volumeRenderer.state,
    );

    this.computationQuad = new ScreenAlignedQuad(this.laoMaterial);

    const geometry = new THREE.PlaneGeometry();
    geometry.translate(0.5, -0.5, 0);
    const material = new THREE.MeshBasicMaterial({
      map: this.intermediateRenderTarget.texture,
    });
    this.copyQuad = new THREE.Mesh(geometry, material);
    this.copyScene.add(this.copyQuad);

    this.reactionDisposers.push(
      reaction(() => volumeRenderer.state.transferFunction.type, this.update),
      reaction(() => volumeRenderer.state.imageOpacity, this.update),
      reaction(() => volumeRenderer.state.contextOpacity, this.update),
      reaction(() => volumeRenderer.state.rangeLimits, this.update),
      reaction(() => volumeRenderer.state.cutAwayConeAngle, this.update),
      reaction(
        () => volumeRenderer.state.image,
        (atlas?: TextureAtlas) => {
          if (!atlas) return;

          this.outputRenderTarget.setSize(atlas.atlasSize.x, atlas.atlasSize.y);

          if (Math.min(atlas.atlasSize.x, atlas.atlasSize.y) < quadSize) {
            this.intermediateRenderTarget.setSize(
              atlas.atlasSize.x,
              atlas.atlasSize.y,
            );

            this.directFrames = true;
          } else {
            this.intermediateRenderTarget.setSize(quadSize, quadSize);

            this.quadGrid.copy(atlas.atlasSize).divideScalar(quadSize).ceil();
            this.quadCount = this.quadGrid.x * this.quadGrid.y;

            this.directFrames = false;
          }

          this.update();
        },
      ),
      reaction(() => volumeRenderer.state.focus, this.update),
    );
  }

  public dispose() {
    this.reactionDisposers.forEach((disposer) => disposer());
    this.laoMaterial.dispose();
  }

  public getLAOTexture() {
    return this.outputRenderTarget.texture;
  }

  public tick() {
    if (this.volumeRenderer.state.lightingMode.needsLAO) {
      if (this.dirty) {
        this.renderInitialLAO();
      } else if (this.volumeRenderer.isShowingFullResolution) {
        if (this.needsCopy) {
          this.copyToOutput();
        } else if (this.laoMaterial.previousDirections < totalLAORays) {
          this.renderNextLAOFrame();
        }
      }
    }
  }

  private renderInitialLAO() {
    this.laoMaterial.setPreviousDirections(0);

    this.renderer.setRenderTarget(this.outputRenderTarget);

    this.computationQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(null);

    this.laoMaterial.setPreviousDirections(8);

    this.dirty = false;

    this.currentQuadId = 0;

    this.needsCopy = false;

    this.volumeRenderer.lazyRender();
  }

  private renderNextLAOFrame() {
    this.renderer.setRenderTarget(this.intermediateRenderTarget);

    this.computationQuad.renderWith(
      this.renderer,
      this.directFrames
        ? undefined
        : {
            fullWidth: this.outputRenderTarget.width,
            fullHeight: this.outputRenderTarget.height,
            x: quadSize * (this.currentQuadId % this.quadGrid.x),
            y: quadSize * Math.floor(this.currentQuadId / this.quadGrid.y),
            width: quadSize,
            height: quadSize,
          },
    );

    this.renderer.setRenderTarget(null);

    if (this.directFrames || this.currentQuadId >= this.quadCount - 1) {
      this.laoMaterial.setPreviousDirections(
        this.laoMaterial.previousDirections + 8,
      );
    }

    this.needsCopy = true;
  }

  private copyToOutput() {
    if (!this.needsCopy) return;

    this.renderer.setRenderTarget(this.outputRenderTarget);

    this.renderer.autoClear = this.directFrames;

    if (this.directFrames) {
      this.copyQuad.position.set(0, 1, 0);
      this.copyQuad.scale.set(1, 1, 1);
    } else {
      this.copyQuad.position.set(
        (quadSize / this.outputRenderTarget.width) *
          (this.currentQuadId % this.quadGrid.x),
        1 -
          (quadSize / this.outputRenderTarget.height) *
            Math.floor(this.currentQuadId / this.quadGrid.y),
        0,
      );

      this.copyQuad.scale.set(
        quadSize / this.outputRenderTarget.width,
        quadSize / this.outputRenderTarget.height,
        1,
      );
    }

    this.renderer.render(this.copyScene, this.copyCamera);

    this.renderer.autoClear = true;
    this.renderer.setRenderTarget(null);

    this.currentQuadId++;

    this.needsCopy = false;

    if (this.directFrames) {
      this.volumeRenderer.updateCurrentResolution();
    } else if (this.currentQuadId >= this.quadCount) {
      this.volumeRenderer.updateCurrentResolution();

      this.currentQuadId = 0;
    }
  }

  private update = () => {
    this.dirty = true;
  };

  public setCameraPosition(position: THREE.Vector3) {
    this.laoMaterial.setCameraPosition(position);

    if (this.volumeRenderer.state.transferFunction.updateLAOOnCameraMove) {
      this.update();
    }
  }
}

export default LAOComputer;
