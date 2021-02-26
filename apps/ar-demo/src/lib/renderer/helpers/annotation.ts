import * as THREE from "three";

import { Renderer } from "..";
import { LimitedStack } from "../../utils";
import AnnotationStructure from "./annotationStructure";

const prototypeMaterial = new THREE.MeshPhongMaterial({
  color: "red",
  side: THREE.DoubleSide,
});

export default class Annotation {
  private undoRedoStack = new LimitedStack<number[]>(20);

  public structures: AnnotationStructure[];
  public structureCount: number;

  public meshGroup = new THREE.Group();

  constructor(private renderer: Renderer, geometries: THREE.BufferGeometry[]) {
    this.structures = geometries.map(
      (geometry, index) =>
        new AnnotationStructure(geometry, prototypeMaterial.clone(), index),
    );
    this.structureCount = this.structures.length;

    this.meshGroup.add(...this.structures);
  }

  public getMaterial = (index: number) => {
    return this.structures[index].material as THREE.MeshPhongMaterial;
  };

  public get pickingMeshes() {
    return this.structures.map((structure) => structure.pickingMesh);
  }

  public deleteStructures = (indexes: number[]) => {
    indexes.forEach((index) => {
      this.structures[index].hide();
    });
    this.undoRedoStack.push(indexes);
  };

  public undo = () => {
    const indexesToShow = this.undoRedoStack.getCurrent();
    if (indexesToShow) {
      indexesToShow.forEach((index) => {
        this.structures[index].show();
        this.renderer.updateColor(index); // make sure the structure is not still shown as selected
      });
      this.undoRedoStack.navigateBackward();

      this.renderer.render();
    }
  };

  public redo = () => {
    const indexesToHide = this.undoRedoStack.navigateForward();
    if (indexesToHide) {
      indexesToHide.forEach((index) => {
        this.structures[index].hide();
      });

      this.renderer.render();
    }
  };
}
