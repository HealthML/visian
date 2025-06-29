import { IEditor, isWindows } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";
import {
  CSS2DObject,
  CSS2DRenderer,
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

export class AxesConvention extends THREE.Scene implements IDisposable {
  public static size = 75;

  public camera: THREE.PerspectiveCamera;

  protected lines: THREE.Line[];
  protected labels: CSS2DObject[];

  protected lineMaterial = new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0.5,
  });

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
      labelDiv.style.fontFamily = "DIN2014";
      labelDiv.style.fontSize = "13px";
      labelDiv.style.fontWeight = "500";
      if (isWindows()) labelDiv.style.marginLeft = "-0.07em";
      const label = new CSS2DObject(labelDiv);
      label.position.copy(direction).multiplyScalar(1.5);

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

    this.labelRenderer.setSize(AxesConvention.size, AxesConvention.size);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.bottom = "0px";
    this.labelRenderer.domElement.style.left = "0px";

    this.disposers.push(
      autorun(() => {
        this.labelRenderer.domElement.style.display =
          editor.activeDocument?.viewSettings.viewMode === "3D"
            ? "block"
            : "none";
      }),
      reaction(
        () => editor.refs.axes3D?.current ?? document.body,
        (parent) => {
          parent.appendChild(this.labelRenderer.domElement);
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.lineMaterial.dispose();
    this.lines.forEach((line) => line.geometry.dispose());
  }

  public setCameraDirection(direction: THREE.Vector3) {
    this.workingVector.copy(direction).normalize().multiplyScalar(-3.5);
    this.camera.position.copy(this.workingVector);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    const threshold = 1.1;
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
