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
}
