import { IDisposable } from "@visian/utils";
import * as THREE from "three";
import { Editor } from "../../../models";
import { CircleCamera } from "./circle-camera";
import { CircleMaterial } from "./circle-material";
import { Circle } from "../types";

export class Circles extends THREE.Scene implements IDisposable {
  private geometry = new THREE.BufferGeometry();
  private material: CircleMaterial;

  public camera: CircleCamera;

  constructor(editor: Editor) {
    super();

    this.material = new CircleMaterial();

    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.add(points);

    this.camera = new CircleCamera(editor);
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.camera.dispose();
  }

  public setFromCircleCenters(circles: Circle[]) {
    const vertices: number[] = [];
    const colors: number[] = [];
    const radiuses: number[] = [];

    circles.forEach((circle) => {
      vertices.push(circle.x, circle.y, 0);
      colors.push(circle.value, circle.value, circle.value);
      radiuses.push(circle.radius);
    });

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Uint8BufferAttribute(colors, 3),
    );
    this.geometry.setAttribute(
      "radius",
      new THREE.Uint8BufferAttribute(radiuses, 1),
    );
  }
}
