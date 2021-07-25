import * as THREE from "three";
import {
  regionGrowing3DFragmentShader,
  regionGrowingFragmentShader,
  regionGrowingVertexShader,
} from "../../shaders";

export class RegionGrowingMaterial extends THREE.ShaderMaterial {
  constructor(parameters?: THREE.ShaderMaterialParameters) {
    super(
      parameters || {
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
      },
    );
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

export class RegionGrowing3DMaterial extends RegionGrowingMaterial {
  constructor() {
    super({
      vertexShader: regionGrowingVertexShader,
      fragmentShader: regionGrowing3DFragmentShader,
      uniforms: {
        uRegionTexture: { value: null },
        uDataTexture: { value: null },
        uThreshold: { value: 0.1 },
        uSeed: { value: 0 },
        uVoxelCount: { value: [1, 1, 1] },
        uAtlasGrid: { value: [1, 1] },
        uRenderValue: { value: 244 / 255 },
      },
    });
  }

  public setRegionSize(_width: number, _height: number) {
    throw new Error("3D region growing does not support a region size.");
  }

  public setUVBounds(_minUv = [0, 0], _maxUv = [1, 1]) {
    throw new Error("3D region growing does not support uv bounds.");
  }

  public setVoxelCount(voxelCount: number[]) {
    this.uniforms.uVoxelCount.value = voxelCount;
  }

  public setAtlasGird(atlasGrid: number[]) {
    this.uniforms.uAtlasGrid.value = atlasGrid;
  }

  public setStep(step: number) {
    this.uniforms.uRenderValue.value = (255 - step) / 255;
  }
}
