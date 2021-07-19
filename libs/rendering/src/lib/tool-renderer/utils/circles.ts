import { IDisposable } from "@visian/utils";
import * as THREE from "three";
import { CircleMaterial } from "./circle-material";
import { Circle } from "./types";

export class Circles extends THREE.Scene implements IDisposable {
  private geometry = new THREE.PlaneBufferGeometry();
  private material: CircleMaterial;
  private mesh!: THREE.InstancedMesh;

  /** The maximum amount of circles that can be rendered with the current instanced mesh. */
  private maxCircles = 16;

  /** Used for convenient matrix generation. */
  private dummy = new THREE.Object3D();

  constructor() {
    super();

    this.material = new CircleMaterial();

    this.createNewMesh();
    this.add(this.mesh);
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.dispose();
  }

  /**
   * Ensures `this.mesh` can fit `count` many circles.
   * Creates a new instanced mesh if necesssary.
   */
  private ensureCirclesFit(count: number) {
    if (count <= this.maxCircles) return;

    while (count > this.maxCircles) {
      this.maxCircles *= 2;
    }

    this.remove(this.mesh);
    this.mesh.dispose();
    this.createNewMesh();
    this.add(this.mesh);
  }

  private createNewMesh() {
    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.maxCircles,
    );
    // Updated every frame.
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }

  public setCircles(circles: Circle[]) {
    this.ensureCirclesFit(circles.length);
    this.mesh.count = circles.length;

    circles.forEach((circle, index) => {
      this.dummy.position.set(circle.x, circle.y, 0);

      const scale = 1 + 2 * circle.radius;
      this.dummy.scale.set(scale, scale, 1);

      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(index, this.dummy.matrix);
    });

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
