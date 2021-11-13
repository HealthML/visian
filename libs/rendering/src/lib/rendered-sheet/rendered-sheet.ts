import { IEditor, noise } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";
import { BlurMaterial } from "./blur-material";
import { RenderedSheetGeometry } from "./rendered-sheet-geometry";

export class RenderedSheet extends THREE.Mesh implements IDisposable {
  private sharedGeometry: RenderedSheetGeometry;

  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
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

    const outline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        this.sharedGeometry.shape.getPoints(),
      ),
      new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.3,
      }),
    );
    outline.position.z = 1;
    this.add(outline);

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
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
