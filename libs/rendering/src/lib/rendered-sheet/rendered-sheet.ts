import { IEditor, noise } from "@visian/ui-shared";
import * as THREE from "three";
import { BlurMaterial } from "./blur-material";
import { RenderedSheetGeometry } from "./rendered-sheet-geometry";

// import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

export class RenderedSheet extends THREE.Mesh {
  private sharedGeometry: RenderedSheetGeometry;

  constructor(editor: IEditor) {
    const params = {
      transmission: 1,
      roughness: 0.75,
      ior: 1.47,
      thickness: 0,
      backgroundOpacity: 0.2,
      noiseOpacity: 1,
      outlineOpacity: 0.3,
    };

    super(new RenderedSheetGeometry(), new BlurMaterial(params));

    this.sharedGeometry = this.geometry as RenderedSheetGeometry;

    const backgroundLayer = new THREE.Mesh(
      this.sharedGeometry,
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: params.backgroundOpacity,
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
        opacity: params.noiseOpacity,
      }),
    );
    this.add(noiseLayer);

    const outline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        this.sharedGeometry.shape.getPoints(),
      ),
      new THREE.LineBasicMaterial({
        transparent: true,
        opacity: params.outlineOpacity,
      }),
    );
    outline.position.z = 1;
    this.add(outline);

    // const gui = new GUI();
    // gui.add(params, "transmission", 0, 1, 0.01).onChange(() => {
    //   (this.material as BlurMaterial).transmission = params.transmission;
    //   editor.sliceRenderer?.lazyRender();
    // });
    // gui.add(params, "roughness", 0, 1, 0.01).onChange(() => {
    //   (this.material as BlurMaterial).roughness = params.roughness;
    //   editor.sliceRenderer?.lazyRender();
    // });
    // gui.add(params, "ior", 1, 2.333, 0.01).onChange(() => {
    //   (this.material as BlurMaterial).ior = params.ior;
    //   editor.sliceRenderer?.lazyRender();
    // });
    // gui.add(params, "thickness", 0, 0.2, 0.005).onChange(() => {
    //   (this.material as BlurMaterial).thickness = params.thickness;
    //   editor.sliceRenderer?.lazyRender();
    // });
    // gui.add(params, "backgroundOpacity", 0, 1, 0.01).onChange(() => {
    //   (backgroundLayer.material as THREE.MeshBasicMaterial).opacity =
    //     params.backgroundOpacity;
    //   editor.sliceRenderer?.lazyRender();
    // });
    // gui.add(params, "noiseOpacity", 0, 1, 0.01).onChange(() => {
    //   (noiseLayer.material as THREE.MeshBasicMaterial).opacity =
    //     params.noiseOpacity;
    //   editor.sliceRenderer?.lazyRender();
    // });
    // gui.add(params, "outlineOpacity", 0, 1, 0.01).onChange(() => {
    //   (outline.material as THREE.LineBasicMaterial).opacity =
    //     params.outlineOpacity;
    //   editor.sliceRenderer?.lazyRender();
    // });
    // gui.open();
  }
}
