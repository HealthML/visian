import * as THREE from "three";

import { IDisposable } from "../types";

class VolumeRenderer implements IDisposable {
  private renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene = new THREE.Scene();

  private lazyRenderTriggerd = true;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.0001,
      6,
    );

    window.addEventListener("resize", this.resize);
    this.resize();

    this.animate();
  }

  public dispose = () => {
    window.removeEventListener("resize", this.resize);
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
