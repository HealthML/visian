import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";

import { TextureAtlas } from "../../../texture-atlas";
import { IDisposable } from "../../../types";
import VolumeRenderer from "../../volume-renderer";
import ScreenAlignedQuad from "../screen-aligned-quad";
import LAOMaterial from "./lao-material";

/**
 * 8 disables the progressive LAO (performance improvements coming soon).
 * To test it try 32 or 128.
 */
export const totalLAORays = 8;

export class LAOComputer implements IDisposable {
  private outputRenderTarget: THREE.WebGLRenderTarget;
  private intermediateRenderTarget: THREE.WebGLRenderTarget;

  private laoMaterial: LAOMaterial;

  private computationQuad: ScreenAlignedQuad;
  private copyQuad: ScreenAlignedQuad;

  private dirty = true;
  private needsCopy = false;

  private reactionDisposers: IReactionDisposer[] = [];

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
    );

    this.computationQuad = new ScreenAlignedQuad(this.laoMaterial);
    this.copyQuad = ScreenAlignedQuad.forTexture(
      this.intermediateRenderTarget.texture,
    );

    this.reactionDisposers.push(
      autorun(() => {
        this.laoMaterial.uniforms.uTransferFunction.value =
          volumeRenderer.transferFunction.type;

        this.update();
      }),
      autorun(() => {
        this.laoMaterial.uniforms.uOpacity.value = volumeRenderer.imageOpacity;

        this.update();
      }),
      autorun(() => {
        this.laoMaterial.uniforms.uContextOpacity.value =
          volumeRenderer.contextOpacity;

        this.update();
      }),
      autorun(() => {
        this.laoMaterial.uniforms.uLimitLow.value =
          volumeRenderer.rangeLimits[0];
        this.laoMaterial.uniforms.uLimitHigh.value =
          volumeRenderer.rangeLimits[1];

        this.update();
      }),
      autorun(() => {
        this.laoMaterial.uniforms.uConeAngle.value =
          volumeRenderer.cutAwayConeAngle;

        this.update();
      }),
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
    if (this.volumeRenderer.lightingMode.needsLAO) {
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

    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.outputRenderTarget);

    this.computationQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(previousRenderTarget);

    this.laoMaterial.setPreviousDirections(8);

    this.dirty = false;

    this.volumeRenderer.lazyRender();
  }

  private renderNextLAOFrame() {
    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.intermediateRenderTarget);

    this.computationQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(previousRenderTarget);

    this.laoMaterial.setPreviousDirections(
      this.laoMaterial.previousDirections + 8,
    );

    this.needsCopy = true;
  }

  private copyToOutput() {
    if (!this.needsCopy) return;

    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.outputRenderTarget);

    this.copyQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(previousRenderTarget);

    this.needsCopy = false;

    this.volumeRenderer.updateCurrentResolution();
  }

  private update = () => {
    this.dirty = true;
  };

  public setAtlas(atlas: TextureAtlas) {
    this.outputRenderTarget.setSize(atlas.atlasSize.x, atlas.atlasSize.y);
    this.intermediateRenderTarget.setSize(atlas.atlasSize.x, atlas.atlasSize.y);

    this.laoMaterial.setAtlas(atlas);

    this.update();
  }

  public setFocusAtlas(atlas?: TextureAtlas) {
    this.laoMaterial.setFocusAtlas(atlas);

    this.update();
  }

  public setCameraPosition(position: THREE.Vector3) {
    this.laoMaterial.setCameraPosition(position);

    if (this.volumeRenderer.transferFunction.updateLAOOnCameraMove) {
      this.update();
    }
  }
}

export default LAOComputer;
