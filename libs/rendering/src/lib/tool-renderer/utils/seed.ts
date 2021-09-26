import { IDocument } from "@visian/ui-shared";
import { IDisposable, IDisposer, Voxel } from "@visian/utils";
import * as THREE from "three";
import { SeedCamera } from "./seed-camera";
import { SeedMaterial } from "./seed-material";

export class Seed extends THREE.Scene implements IDisposable {
  public camera: SeedCamera;

  private geometry: THREE.BufferGeometry;
  private material: SeedMaterial;

  private workingVector = new THREE.Vector3();

  private disposers: IDisposer[] = [];

  constructor(document: IDocument) {
    super();

    this.camera = new SeedCamera(document);

    this.geometry = new THREE.BufferGeometry().setFromPoints([
      this.workingVector,
    ]);
    this.material = new SeedMaterial(document);

    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.add(points);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.camera.dispose();
  }

  public setPosition(voxel: Voxel) {
    this.workingVector.set(voxel.x, voxel.y, voxel.z);
    this.geometry.setFromPoints([this.workingVector]);
  }
}
