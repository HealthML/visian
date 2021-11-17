import { IDocument } from "@visian/ui-shared";
import { IDisposable, IDisposer, Pixel } from "@visian/utils";
import * as THREE from "three";
import { SeedCamera } from "./seed-camera";

export class Seed extends THREE.Scene implements IDisposable {
  public camera: SeedCamera;

  private geometry: THREE.BufferGeometry;

  private workingVector = new THREE.Vector2();

  private disposers: IDisposer[] = [];

  constructor(document: IDocument) {
    super();

    this.camera = new SeedCamera(document);

    this.geometry = new THREE.BufferGeometry().setFromPoints([
      this.workingVector,
    ]);

    const points = new THREE.Points(
      this.geometry,
      new THREE.PointsMaterial({ size: 0.5 }),
    );
    this.add(points);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.camera.dispose();
  }

  public setPosition(pixel: Pixel) {
    this.workingVector.set(pixel.x, pixel.y);
    this.geometry.setFromPoints([this.workingVector]);
  }
}
