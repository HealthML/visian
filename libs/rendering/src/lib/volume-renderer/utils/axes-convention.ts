import { IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

const directions = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

const labels = ["S", "I", "R", "L", "P", "A"];

export class AxesConvention extends THREE.Scene {
  public camera: THREE.PerspectiveCamera;

  protected superior: THREE.Line;
  protected inferior: THREE.Line;
  protected right: THREE.Line;
  protected left: THREE.Line;
  protected posterior: THREE.Line;
  protected anterior: THREE.Line;

  protected lineMaterial = new THREE.LineBasicMaterial();

  protected labelRenderer = new CSS2DRenderer();

  private workingVector = new THREE.Vector3();

  protected disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super();

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.0001, 20);

    const origin = new THREE.Vector3();

    [
      this.superior,
      this.inferior,
      this.right,
      this.left,
      this.posterior,
      this.anterior,
    ] = directions.map((direction, index) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([origin, direction]),
        this.lineMaterial,
      );

      const labelDiv = document.createElement("div");
      labelDiv.textContent = labels[index];
      const earthLabel = new CSS2DObject(labelDiv);
      earthLabel.position.copy(direction).multiplyScalar(1.3);
      line.add(earthLabel);

      return line;
    });

    this.add(
      this.superior,
      this.inferior,
      this.right,
      this.left,
      this.anterior,
      this.posterior,
    );

    this.labelRenderer.setSize(100, 100);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.bottom = "0px";
    this.labelRenderer.domElement.style.left = "0px";
    document.body.appendChild(this.labelRenderer.domElement);

    this.disposers.push(
      autorun(() => {
        this.labelRenderer.domElement.style.display =
          editor.activeDocument?.viewSettings.viewMode === "3D"
            ? "block"
            : "none";
      }),
    );
  }

  public setCameraDirection(direction: THREE.Vector3) {
    this.workingVector.copy(direction).normalize().multiplyScalar(-3);
    this.camera.position.copy(this.workingVector);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  public renderLabels() {
    this.labelRenderer.render(this, this.camera);
  }
}
