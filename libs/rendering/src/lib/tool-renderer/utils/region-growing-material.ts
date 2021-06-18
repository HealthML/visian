import * as THREE from "three";
import {
  regionGrowingFragmentShader,
  regionGrowingVertexShader,
} from "../../shaders";

export class RegionGrowingMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: regionGrowingVertexShader,
      fragmentShader: regionGrowingFragmentShader,
      uniforms: {
        uRegionSize: { value: [1, 1] },
        uRegionTexture: { value: null },
        uDataTexture: { value: null },
        uThreshold: { value: 0.1 },
        uSeed: { value: 0 },
        uMinUv: { value: [0, 0] },
        uMaxUv: { value: [1, 1] },
      },
    });
  }

  public setRegionTexture(texture: THREE.Texture) {
    this.uniforms.uRegionTexture.value = texture;
  }

  public setDataTexture(texture: THREE.Texture) {
    this.uniforms.uDataTexture.value = texture;
  }

  public setRegionSize(width: number, height: number) {
    this.uniforms.uRegionSize.value = [width, height];
  }

  public setThreshold(value: number) {
    this.uniforms.uThreshold.value = value / 255;
  }

  public setSeed(value: number) {
    this.uniforms.uSeed.value = value / 255;
  }

  public setUVBounds(minUv = [0, 0], maxUv = [1, 1]) {
    this.uniforms.uMinUv.value = minUv;
    this.uniforms.uMaxUv.value = maxUv;
  }
}
