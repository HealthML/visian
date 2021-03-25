import { IDisposer, TextureAtlas } from "@visian/util";
import { reaction } from "mobx";
import * as THREE from "three";

import { Slice } from "./slice";
import { IDisposable, viewTypes } from "./types";
import { setMainCameraPlanes } from "./utils";

import type { Editor } from "../../models";
import type { Image } from "../../models/editor/image";

export class SliceRenderer implements IDisposable {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private scene = new THREE.Scene();

  private slices: Slice[];

  private lazyRenderTriggered = true;

  private isImageLoaded = false;

  private disposers: IDisposer[] = [];

  constructor(private canvas: HTMLCanvasElement, private editor: Editor) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas });

    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 20);

    this.slices = viewTypes.map(
      (viewType) => new Slice(editor, viewType, this.lazyRender),
    );
    this.scene.add(this.slices[editor.viewSettings.mainViewType]);

    window.addEventListener("resize", this.resize);
    this.resize();

    canvas.addEventListener("wheel", this.handleWheel);

    this.disposers.push(
      reaction(
        () => editor.image,
        (image?: Image) => {
          if (image) {
            this.setImage(
              new TextureAtlas(
                new THREE.Vector3().fromArray(image.voxelCount),
                new THREE.Vector3().fromArray(image.voxelSpacing),
                THREE.NearestFilter,
              ).setData(image.data),
            );
          }
        },
        { fireImmediately: true },
      ),
    );

    this.renderer.setAnimationLoop(this.animate);
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
    this.slices.forEach((slice) => slice.dispose());
    window.removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("wheel", this.handleWheel);
  }

  private resize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    setMainCameraPlanes(this.editor, this.canvas, this.camera);

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

  // TODO: Move this to event handling.
  private handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      if (event.deltaY > 0) {
        this.editor.viewSettings.zoomOut();
      } else if (event.deltaY < 0) {
        this.editor.viewSettings.zoomIn();
      }
    } else {
      this.editor.viewSettings.stepSelectedSlice(-Math.sign(event.deltaY));
    }
  };

  public setImage(atlas: TextureAtlas) {
    this.slices.forEach((slice) => slice.setAtlas(atlas));
    this.isImageLoaded = true;

    this.lazyRender();
  }
}

export default SliceRenderer;
