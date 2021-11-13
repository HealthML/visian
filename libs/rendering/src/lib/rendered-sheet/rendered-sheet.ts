import { IEditor, noise } from "@visian/ui-shared";
import * as THREE from "three";
import { BlurMaterial } from "./blur-material";
import { RenderedSheetGeometry } from "./rendered-sheet-geometry";

export class RenderedSheet extends THREE.Mesh {
  private sharedGeometry: RenderedSheetGeometry;

  constructor(editor: IEditor) {
    const params = {
      transmission: 1,
      roughness: 0.75,
      ior: 1.49,
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
  }
}
