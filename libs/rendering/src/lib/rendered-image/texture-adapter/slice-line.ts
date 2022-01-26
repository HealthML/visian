import { getPlaneAxes, IDisposable, Vector, ViewType } from "@visian/utils";
import * as THREE from "three";

import { MergeMaterial } from "./merge-material";

export class SliceLine extends THREE.Scene implements IDisposable {
  public camera: THREE.Camera;

  private line: THREE.Line;

  private viewType = ViewType.Sagittal;
  private sourceSlice = 0;

  private workingVector0 = new THREE.Vector2();
  private workingVector1 = new THREE.Vector2();

  constructor(public material: MergeMaterial, private voxelCount: Vector) {
    super();

    this.camera = new THREE.OrthographicCamera(
      -0.5,
      voxelCount.x - 0.5,
      voxelCount.y - 0.5,
      -0.5,
      0,
      2,
    );

    this.line = new THREE.Line(new THREE.BufferGeometry(), material);
    this.line.geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 1, 1, 1], 2),
    );
    this.add(this.line);
  }

  public dispose() {
    this.material.dispose();
    this.line.geometry.dispose();
  }

  public setSourceSlice(sourceSlice: number, viewType: ViewType) {
    if (viewType === ViewType.Transverse) {
      throw new Error(
        "SliceLine shouldn't be used for a Transverse slice. Use a quad instead.",
      );
    }

    if (
      sourceSlice < 0 ||
      sourceSlice >= this.voxelCount.getFromView(viewType)
    ) {
      throw new Error("Invalid source slice number.");
    }

    if (sourceSlice !== this.sourceSlice || viewType !== this.viewType) {
      this.sourceSlice = sourceSlice;
      this.viewType = viewType;

      this.updateGeometry();
    }
  }

  public setTargetSlice(targetSlice: number) {
    if (targetSlice < 0 || targetSlice >= this.voxelCount.z) {
      throw new Error("Invalid target slice number.");
    }

    const uvAttribute = this.line.geometry.attributes
      .uv as THREE.BufferAttribute;

    const [widthAxis] = getPlaneAxes(this.viewType);

    uvAttribute.setXY(
      0,
      0.5 / this.voxelCount[widthAxis],
      (targetSlice + 0.5) / this.voxelCount.z,
    );
    uvAttribute.setXY(
      1,
      1 + 0.5 / this.voxelCount[widthAxis],
      (targetSlice + 0.5) / this.voxelCount.z,
    );
    uvAttribute.needsUpdate = true;
  }

  private updateGeometry() {
    const oldGeometry = this.line.geometry;

    const newGeometry = new THREE.BufferGeometry().setFromPoints([
      this.workingVector0.set(
        this.viewType === ViewType.Sagittal ? this.sourceSlice : 0,
        this.viewType === ViewType.Sagittal ? 0 : this.sourceSlice,
      ),
      this.workingVector1.set(
        this.viewType === ViewType.Sagittal
          ? this.sourceSlice
          : this.voxelCount.x,
        this.viewType === ViewType.Sagittal
          ? this.voxelCount.y
          : this.sourceSlice,
      ),
    ]);

    newGeometry.setAttribute("uv", oldGeometry.attributes.uv);
    this.line.geometry = newGeometry;

    oldGeometry.dispose();
  }
}
