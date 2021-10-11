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

  protected lines: THREE.Line[];
  protected labels: CSS2DObject[];

  protected lineMaterial = new THREE.LineBasicMaterial();

  protected labelRenderer = new CSS2DRenderer();

  private workingVector = new THREE.Vector3();

  protected disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super();

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.0001, 20);

    const origin = new THREE.Vector3();

    this.labels = directions.map((direction, index) => {
      const labelDiv = document.createElement("div");
      labelDiv.textContent = labels[index];
      const label = new CSS2DObject(labelDiv);
      label.position.copy(direction).multiplyScalar(1.3);

      return label;
    });

    this.lines = directions.map((direction, index) => {
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([origin, direction]),
        this.lineMaterial,
      );

      line.add(this.labels[index]);

      return line;
    });

    this.add(...this.lines);

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

    const threshold = 0.4;
    this.labels[0].visible = this.camera.position.y >= -threshold;
    this.labels[1].visible = this.camera.position.y <= threshold;
    this.labels[2].visible = this.camera.position.x >= -threshold;
    this.labels[3].visible = this.camera.position.x <= threshold;
    this.labels[4].visible = this.camera.position.z >= -threshold;
    this.labels[5].visible = this.camera.position.z <= threshold;
  }

  public renderLabels() {
    this.labelRenderer.render(this, this.camera);
  }
}
