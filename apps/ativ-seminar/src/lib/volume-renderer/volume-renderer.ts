import { ITKImage } from "@visian/util";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { IDisposable } from "../types";
import Volume from "./volume";

export class VolumeRenderer implements IDisposable {
  private renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene = new THREE.Scene();

  private volume: Volume;

  private orbitControls: OrbitControls;

  private lazyRenderTriggered = true;

  private isImageLoaded = false;

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
    this.orbitControls.addEventListener("change", this.onCameraMove);

    this.volume = new Volume();
    this.scene.add(this.volume);

    window.addEventListener("resize", this.resize);
    this.resize();

    this.onCameraMove();
    this.renderer.setAnimationLoop(this.animate);
  }

  public dispose = () => {
    window.removeEventListener("resize", this.resize);
    this.orbitControls.removeEventListener("change", this.onCameraMove);
    this.orbitControls.dispose();
  };

  private resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.eagerRender();
  };

  private animate = () => {
    if (this.lazyRenderTriggered) this.eagerRender();
  };

  public lazyRender = () => {
    this.lazyRenderTriggered = true;
  };

  private eagerRender = () => {
    if (!this.isImageLoaded) return;
    this.lazyRenderTriggered = false;

    this.renderer.render(this.scene, this.camera);
  };

  private onCameraMove = () => {
    this.volume.updateCameraPosition(this.camera);
    this.lazyRender();
  };

  public setImage = (image: ITKImage) => {
    this.volume.setImage(image);
    this.isImageLoaded = true;

    // TODO: Can we maybe find a solution that does not require
    // double-rendering for the initial frame?
    this.eagerRender();
    this.onCameraMove();
  };
}

export default VolumeRenderer;
