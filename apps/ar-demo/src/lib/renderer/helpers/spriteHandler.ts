import * as THREE from "three";

import { Renderer } from "..";
import * as SCAN from "../../staticScan";
import atlas from "../../staticScan/brain-texture-atlas.png";
import { ViewType, viewTypes, Voxel } from "../../types";
import {
  getCameraOctant,
  getOctantPlanes,
  getPlaneAxes,
  getSplitPlane,
} from "../../utils";
import { fragmentShader, SpriteUniforms, vertexShader } from "../shader";

export default class SpriteHandler {
  private sprites: THREE.Mesh[][];
  public spriteGroup: THREE.Group;

  private uniforms: SpriteUniforms;

  private materials: THREE.ShaderMaterial[];

  private cameraOctant?: number;

  public selectedVoxel: Voxel = {
    x: Math.floor(SCAN.voxelCount.x / 2),
    y: Math.floor(SCAN.voxelCount.y / 2),
    z: Math.floor(SCAN.voxelCount.z / 2),
  };

  constructor(private renderer: Renderer) {
    const loader = new THREE.TextureLoader();
    const scanTexture = loader.load(atlas, () => {
      renderer.render();
    });
    scanTexture.magFilter = THREE.NearestFilter;
    scanTexture.minFilter = THREE.NearestFilter;

    this.uniforms = {
      activeSlices: {
        value: [
          this.selectedVoxel.x,
          this.selectedVoxel.y,
          this.selectedVoxel.z,
        ],
      },
      scanSize: {
        value: [SCAN.voxelCount.x, SCAN.voxelCount.y, SCAN.voxelCount.z],
      },
      sliceCountU: { value: SCAN.atlasGrid.x },
      sliceCountV: { value: SCAN.atlasGrid.y },
      scanBackground: { value: 0 },
      dataTexture: {
        type: "t",
        value: scanTexture,
      },
      contrast: { value: 1 },
      brightness: { value: 1 },
      blueTint: { value: true },
      opacity: { value: 0.5 },
    };

    this.materials = viewTypes.map((viewType) => {
      return new THREE.ShaderMaterial({
        fragmentShader: fragmentShader(viewType),
        transparent: true,
        vertexShader,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        uniforms: this.uniforms as any,
        side: THREE.DoubleSide,
      });
    });

    this.sprites = viewTypes.map((viewType) => {
      const axes = getPlaneAxes(viewType);
      const width = SCAN.voxelCount[axes[0]] * SCAN.voxelDimensions[axes[0]];
      const height = SCAN.voxelCount[axes[1]] * SCAN.voxelDimensions[axes[1]];

      const sprite = getSplitPlane(this.materials[viewType]);
      sprite.forEach((spritePart) => {
        spritePart.scale.set(width / 2, height / 2, 1);

        // eslint-disable-next-line no-param-reassign
        spritePart.userData.viewType = viewType;

        if (viewType === ViewType.Sagittal) {
          spritePart.rotateX(Math.PI / 2);
          spritePart.rotateY(-Math.PI / 2);
        } else if (viewType === ViewType.Coronal) {
          spritePart.rotateX(Math.PI / 2);
        }
      });

      return sprite;
    });

    this.spriteGroup = new THREE.Group();
    this.spriteGroup.add(...this.spriteParts);

    this.setSelectedVoxel(this.selectedVoxel);
  }

  public get spriteParts() {
    return this.sprites.flat();
  }

  public setOpacity = (opacity: number) => {
    this.materials.forEach((material) => {
      // eslint-disable-next-line no-param-reassign
      material.uniforms.opacity.value = opacity;
    });

    this.renderer.render();
  };

  public setContrast = (contrast: number) => {
    this.materials.forEach((material) => {
      // eslint-disable-next-line no-param-reassign
      material.uniforms.contrast.value = contrast;
    });

    this.renderer.render();
  };

  public setBrightness = (brightness: number) => {
    this.materials.forEach((material) => {
      // eslint-disable-next-line no-param-reassign
      material.uniforms.brightness.value = brightness;
    });

    this.renderer.render();
  };

  public setSpriteVisibility = (visible: boolean) => {
    this.spriteGroup.visible = visible;
    this.renderer.render();
  };

  public setSelectedVoxel = (voxel: Voxel) => {
    this.selectedVoxel = voxel;

    this.materials.forEach((material) => {
      // eslint-disable-next-line no-param-reassign
      ((material.uniforms as unknown) as SpriteUniforms).activeSlices.value[0] =
        voxel.x;
      // eslint-disable-next-line no-param-reassign
      ((material.uniforms as unknown) as SpriteUniforms).activeSlices.value[1] =
        voxel.y;
      // eslint-disable-next-line no-param-reassign
      ((material.uniforms as unknown) as SpriteUniforms).activeSlices.value[2] =
        voxel.z;
    });

    viewTypes.forEach((viewType) => {
      this.scaleSprite(viewType);
    });

    this.positionSpriteGroup();

    this.renderer.render();
  };

  private positionSpriteGroup = () => {
    this.spriteGroup.position.set(
      // x axis of texture atlas is inverted ...
      (SCAN.voxelCount.x - this.selectedVoxel.x - 1) * SCAN.voxelDimensions.x,
      this.selectedVoxel.y * SCAN.voxelDimensions.y,
      this.selectedVoxel.z * SCAN.voxelDimensions.z,
    );
  };

  public updateRenderOrder = () => {
    this.spriteGroup.updateMatrixWorld();

    const cameraPosition = this.spriteGroup.worldToLocal(
      this.renderer.camera.position.clone(),
    );

    const cameraOctant = getCameraOctant(cameraPosition);

    if (cameraOctant === this.cameraOctant) return this.renderer.render();

    this.cameraOctant = cameraOctant;

    const renderOrder0 = 7 - cameraOctant;
    const renderOrder2 = cameraOctant;

    this.spriteParts.forEach((spritePart) => {
      // eslint-disable-next-line no-param-reassign
      spritePart.renderOrder = 1;
    });

    getOctantPlanes(renderOrder0, this.sprites)?.forEach((spritePart) => {
      // eslint-disable-next-line no-param-reassign
      spritePart.renderOrder = 0;
    });
    getOctantPlanes(renderOrder2, this.sprites)?.forEach((spritePart) => {
      // eslint-disable-next-line no-param-reassign
      spritePart.renderOrder = 2;
    });

    return this.renderer.render();
  };

  private scaleSprite = (viewType: ViewType) => {
    const sprite = this.sprites[viewType];

    const planeAxes = getPlaneAxes(viewType);
    const xAxis = planeAxes[0];
    const yAxis = planeAxes[1];

    sprite[0].scale.set(
      (SCAN.voxelCount[xAxis] - this.selectedVoxel[xAxis] - 0.5) *
        SCAN.voxelDimensions[xAxis],
      (this.selectedVoxel[yAxis] + 0.5) * SCAN.voxelDimensions[yAxis],
      1,
    );
    sprite[1].scale.set(
      (this.selectedVoxel[xAxis] + 0.5) * SCAN.voxelDimensions[xAxis],
      (this.selectedVoxel[yAxis] + 0.5) * SCAN.voxelDimensions[yAxis],
      1,
    );
    sprite[2].scale.set(
      (SCAN.voxelCount[xAxis] - this.selectedVoxel[xAxis] - 0.5) *
        SCAN.voxelDimensions[xAxis],
      (SCAN.voxelCount[yAxis] - this.selectedVoxel[yAxis] - 0.5) *
        SCAN.voxelDimensions[yAxis],
      1,
    );
    sprite[3].scale.set(
      (this.selectedVoxel[xAxis] + 0.5) * SCAN.voxelDimensions[xAxis],
      (SCAN.voxelCount[yAxis] - this.selectedVoxel[yAxis] - 0.5) *
        SCAN.voxelDimensions[yAxis],
      1,
    );

    const geometryUVs = sprite.map(
      (spritePart) =>
        (spritePart.geometry as THREE.BufferGeometry).getAttribute(
          "uv",
        ) as THREE.BufferAttribute,
    );

    const width0 =
      (SCAN.voxelCount[xAxis] - this.selectedVoxel[xAxis] - 0.5) /
      SCAN.voxelCount[xAxis];
    const height0 = (this.selectedVoxel[yAxis] + 0.5) / SCAN.voxelCount[yAxis];
    geometryUVs[0].setY(0, height0);
    geometryUVs[0].setXY(1, width0, height0);
    geometryUVs[0].setX(3, width0);
    geometryUVs[0].needsUpdate = true;

    geometryUVs[1].setXY(0, width0, height0);
    geometryUVs[1].setY(1, height0);
    geometryUVs[1].setX(2, width0);
    geometryUVs[1].needsUpdate = true;

    geometryUVs[2].setX(1, width0);
    geometryUVs[2].setY(2, height0);
    geometryUVs[2].setXY(3, width0, height0);
    geometryUVs[2].needsUpdate = true;

    geometryUVs[3].setX(0, width0);
    geometryUVs[3].setXY(2, width0, height0);
    geometryUVs[3].setY(3, height0);
    geometryUVs[3].needsUpdate = true;
  };
}
