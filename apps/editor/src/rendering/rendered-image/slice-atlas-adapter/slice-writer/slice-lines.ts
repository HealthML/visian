import {
  getAtlasGrid,
  getAtlasSize,
  getOrthogonalAxis,
  Vector,
  ViewType,
} from "@visian/utils";
import * as THREE from "three";

import { SliceLinesMaterial } from "./slice-lines-material";

export class SliceLines extends THREE.LineSegments {
  private geometries = [
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
  ];

  private viewType = ViewType.Transverse;

  public readonly camera: THREE.Camera;

  constructor(
    voxelCount: Vector,
    private textures: THREE.Texture[],
    atlasGrid = getAtlasGrid(voxelCount),
    atlasSize = getAtlasSize(voxelCount),
  ) {
    super(undefined, new SliceLinesMaterial(atlasGrid, voxelCount, null));

    this.frustumCulled = false;

    const sagittalPoints: THREE.Vector3[] = [];
    for (let slice = 0; slice < voxelCount.z; slice++) {
      sagittalPoints.push(new THREE.Vector3(0, 0, slice));
      sagittalPoints.push(new THREE.Vector3(0, voxelCount.y, slice));
    }
    this.geometries[ViewType.Sagittal].setFromPoints(sagittalPoints);

    const coronalPoints: THREE.Vector3[] = [];
    for (let slice = 0; slice < voxelCount.z; slice++) {
      coronalPoints.push(new THREE.Vector3(0, 0, slice));
      coronalPoints.push(new THREE.Vector3(voxelCount.x, 0, slice));
    }
    this.geometries[ViewType.Coronal].setFromPoints(coronalPoints);

    this.camera = new THREE.OrthographicCamera(
      -0.5,
      atlasSize.x - 0.5,
      atlasSize.y - 0.5,
      -0.5,
      0,
      10,
    );
  }

  public setSlice(viewType: ViewType, slice: number) {
    if (this.viewType !== viewType) {
      (this.material as SliceLinesMaterial).setViewType(
        viewType,
        this.textures[viewType],
      );

      this.geometry = this.geometries[viewType];

      this.viewType = viewType;
    }

    this.position.setScalar(0);
    const axis = getOrthogonalAxis(viewType);
    this.position[axis] = slice;
  }
}
