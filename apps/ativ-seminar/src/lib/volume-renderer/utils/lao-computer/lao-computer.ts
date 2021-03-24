import { autorun, IReactionDisposer } from "mobx";
import * as THREE from "three";

import { IDisposable } from "../../../types";
import VolumeRenderer from "../../volume-renderer";
import ScreenAlignedQuad from "../screen-aligned-quad";
import TextureAtlas from "../texture-atlas";
import LAOMaterial from "./lao-material";

export class LAOComputer implements IDisposable {
  private renderTarget: THREE.WebGLRenderTarget;

  private laoMaterial: LAOMaterial;

  private screenAlignedQuad: ScreenAlignedQuad;

  private laoComputed = false;

  private reactionDisposers: IReactionDisposer[] = [];

  constructor(
    private renderer: THREE.WebGLRenderer,
    private volumeRenderer: VolumeRenderer,
    firstDerivativeTexture: THREE.Texture,
    secondDerivativeTexture: THREE.Texture,
  ) {
    this.renderTarget = new THREE.WebGLRenderTarget(1, 1);

    this.laoMaterial = new LAOMaterial(
      firstDerivativeTexture,
      secondDerivativeTexture,
    );

    this.screenAlignedQuad = new ScreenAlignedQuad(this.laoMaterial);

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
    if (!this.laoComputed) {
      this.update();
    }

    return this.renderTarget.texture;
  }

  public update = () => {
    const previousRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.renderTarget);

    this.screenAlignedQuad.renderWith(this.renderer);

    this.renderer.setRenderTarget(previousRenderTarget);

    this.laoComputed = true;
  };

  public setAtlas(atlas: TextureAtlas) {
    this.renderTarget.setSize(atlas.atlasSize.x, atlas.atlasSize.y);

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
