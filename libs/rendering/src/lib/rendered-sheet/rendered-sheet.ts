import { IEditor, noise } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";
import { BlurMaterial } from "./blur-material";
import { RenderedSheetGeometry } from "./rendered-sheet-geometry";

export class RenderedSheet extends THREE.Mesh implements IDisposable {
  private sharedGeometry: RenderedSheetGeometry;

  private domElement?: HTMLElement;

  private disposers: IDisposer[] = [];

  constructor(
    private editor: IEditor,
    viewportElementName: string,
    private camera: THREE.OrthographicCamera,
  ) {
    super(new RenderedSheetGeometry(), new BlurMaterial());

    this.sharedGeometry = this.geometry as RenderedSheetGeometry;

    const backgroundLayer = new THREE.Mesh(
      this.sharedGeometry,
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.2,
        color: 0x4e5059,
      }),
    );
    this.add(backgroundLayer);

    const loader = new THREE.TextureLoader();
    const noiseMap = loader.load(noise, () =>
      editor.sliceRenderer?.lazyRender(),
    );
    noiseMap.wrapS = THREE.RepeatWrapping;
    noiseMap.wrapT = THREE.RepeatWrapping;
    const noiseLayer = new THREE.Mesh(
      this.sharedGeometry,
      new THREE.MeshBasicMaterial({
        map: noiseMap,
        transparent: true,
        opacity: 1,
      }),
    );
    this.add(noiseLayer);

    this.disposers.push(
      autorun(() => {
        if (editor.colorMode === "dark") {
          backgroundLayer.material.color.set(0x4e5059);
          backgroundLayer.material.opacity = 0.2;
        } else {
          backgroundLayer.material.color.set(0xc8c8c8);
          backgroundLayer.material.opacity = 0.4;
        }
        editor.sliceRenderer?.lazyRender();
      }),
      reaction(
        () => editor.refs[viewportElementName]?.current,
        (domElement) => {
          if (domElement) {
            this.domElement = domElement;
          } else {
            this.domElement = undefined;
          }
          this.updateVisibility();
        },
        { fireImmediately: true },
      ),
      reaction(
        () => this.editor.activeDocument?.viewport2D.showSideViews,
        this.updateVisibility,
      ),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }

  public synchPosition = () => {
    if (!this.domElement) return;
    const boundingBox = this.domElement.getBoundingClientRect();
    const center = {
      x: (boundingBox.left + boundingBox.right) / 2 / window.innerWidth,
      y:
        (window.innerHeight - (boundingBox.top + boundingBox.bottom) / 2) /
        window.innerHeight,
    };

    const cameraSize = {
      width: this.camera.right - this.camera.left,
      height: this.camera.top - this.camera.bottom,
    };

    this.position.set(
      center.x * cameraSize.width + this.camera.left,
      center.y * cameraSize.height + this.camera.bottom,
      this.position.z,
    );
  };

  private updateVisibility = () => {
    this.visible = Boolean(
      this.domElement && this.editor.activeDocument?.viewport2D.showSideViews,
    );

    // Wrapped in setTimeout to ensure the dom element has appeared.
    if (this.visible) setTimeout(this.synchPosition, 10);

    this.editor.sliceRenderer?.lazyRender();
  };
}
