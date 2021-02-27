import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { IDisposable } from "../types";
import Volume from "./volume";

class VolumeRenderer implements IDisposable {
  private renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene = new THREE.Scene();

  private orbitControls: OrbitControls;

  private lazyRenderTriggerd = true;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.0001,
      10,
    );

    this.camera.position.set(3, 3, 3);
    this.camera.lookAt(0, 0, 0);

    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.addEventListener("change", this.lazyRender);

    this.scene.add(new Volume());

    window.addEventListener("resize", this.resize);
    this.resize();

    this.renderer.setAnimationLoop(this.animate);
  }

  public dispose = () => {
    window.removeEventListener("resize", this.resize);
    this.orbitControls.removeEventListener("change", this.lazyRender);
    this.orbitControls.dispose();
  };

  private resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.eagerRender();
  };

  private animate = () => {
    if (this.lazyRenderTriggerd) this.eagerRender();
  };

  public lazyRender = () => {
    this.lazyRenderTriggerd = true;
  };

  private eagerRender = () => {
    this.lazyRenderTriggerd = false;

    this.renderer.render(this.scene, this.camera);
  };
}

export default VolumeRenderer;
