import * as THREE from "three";

const directions = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

export class AxesConvention extends THREE.Scene {
  public camera: THREE.PerspectiveCamera;

  protected superior: THREE.Line;
  protected inferior: THREE.Line;
  protected left: THREE.Line;
  protected right: THREE.Line;
  protected anterior: THREE.Line;
  protected posterior: THREE.Line;

  protected lineMaterial = new THREE.LineBasicMaterial();

  private workingVector = new THREE.Vector3();

  constructor() {
    super();

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.0001, 20);

    const origin = new THREE.Vector3();

    [
      this.superior,
      this.inferior,
      this.right,
      this.left,
      this.anterior,
      this.posterior,
    ] = directions.map(
      (direction) =>
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([origin, direction]),
          this.lineMaterial,
        ),
    );

    this.add(
      this.superior,
      this.inferior,
      this.right,
      this.left,
      this.anterior,
      this.posterior,
    );
  }

  public setCameraDirection(direction: THREE.Vector3) {
    this.workingVector.copy(direction).normalize().multiplyScalar(-2.5);
    this.camera.position.copy(this.workingVector);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }
}
