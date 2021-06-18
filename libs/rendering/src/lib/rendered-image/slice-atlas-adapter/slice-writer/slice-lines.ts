import {
  getAtlasGrid,
  getAtlasSize,
  getOrthogonalAxis,
  Vector,
  ViewType,
} from "@visian/utils";
import * as THREE from "three";
import { MergeFunction } from "../../types";

import { SliceLinesMaterial } from "./slice-lines-material";
import { SliceScene } from "./types";

/**
 * A representation of a slice of a 3D image that can be rendered into
 * a texture atlas even if the view type does not correspond to the
 * atlas view type.
 */
export class SliceLines extends THREE.Scene implements SliceScene {
  private lines: THREE.LineSegments;

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
    super();

    this.lines = new THREE.LineSegments(
      undefined,
      new SliceLinesMaterial(atlasGrid, voxelCount, null),
    );
    this.lines.frustumCulled = false;
    this.add(this.lines);

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
      (this.lines.material as SliceLinesMaterial).setViewType(viewType);
      (this.lines.material as SliceLinesMaterial).setTexture(
        this.textures[viewType],
      );

      this.lines.geometry = this.geometries[viewType];

      this.viewType = viewType;
    }

    this.position.setScalar(0);
    const axis = getOrthogonalAxis(viewType);
    this.position[axis] = slice;
  }

  public setOverrideTexture(texture?: THREE.Texture) {
    (this.lines.material as SliceLinesMaterial).setTexture(
      texture || this.textures[this.viewType],
    );
  }

  public setMergeFunction(mergeFunction: MergeFunction) {
    (this.lines.material as SliceLinesMaterial).setMergeFunction(mergeFunction);
  }
}
