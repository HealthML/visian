import { TextureAtlas } from "@visian/util";
import { autorun } from "mobx";
import { IDisposer } from "mobx-utils/lib/utils";
import * as THREE from "three";

import { Editor } from "../models";
import { Slice } from "./slice";
import { IDisposable, ViewType, viewTypes } from "./types";

export class SliceRenderer implements IDisposable {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private scene = new THREE.Scene();

  private slices: Slice[];

  private activeView = ViewType.Transverse;

  private lazyRenderTriggered = true;

  private isImageLoaded = false;

  private disposers: IDisposer[] = [];

  constructor(private canvas: HTMLCanvasElement, editor: Editor) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas });

    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 20);

    this.slices = viewTypes.map((viewType) => new Slice(editor, viewType));
    this.scene.add(this.slices[this.activeView]);

    window.addEventListener("resize", this.resize);
    this.resize();

    this.disposers.push(
      autorun(() => {
        const image = editor.image;
        if (image) {
          this.setImage(
            new TextureAtlas(
              new THREE.Vector3().fromArray(image.voxelCount),
              new THREE.Vector3().fromArray(image.voxelSpacing),
              THREE.NearestFilter,
            ).setData(image.data),
          );
        }
      }),
    );

    this.renderer.setAnimationLoop(this.animate);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.slices.forEach((slice) => slice.dispose());
  }

  private resize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.updateProjectionMatrix();

    this.eagerRender();
  };

  private animate = () => {
    if (this.lazyRenderTriggered) {
      this.eagerRender();
    }
  };

  public lazyRender = () => {
    this.lazyRenderTriggered = true;
  };

  private eagerRender = () => {
    if (!this.isImageLoaded) return;
    this.lazyRenderTriggered = false;

    this.renderer.render(this.scene, this.camera);
  };

  public setImage(atlas: TextureAtlas) {
    this.slices.forEach((slice) => slice.setAtlas(atlas));
    this.isImageLoaded = true;

    this.lazyRender();
  }
}

export default SliceRenderer;
