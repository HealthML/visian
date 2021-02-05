import * as THREE from "three";

import { Renderer } from "..";
import { LimitedStack } from "../../utils";

export default class AnnotationHandler {
  private undoRedoStack = new LimitedStack<number[]>(20);

  constructor(
    private renderer: Renderer,
    private meshes: THREE.Object3D[],
    private pickingMeshes: THREE.Object3D[],
  ) {}

  public deleteConnectedStructures = (indexes: number[]) => {
    indexes.forEach((index) => {
      this.meshes[index].visible = false;
      this.pickingMeshes[index].visible = false;
    });
    this.undoRedoStack.push(indexes);
  };

  public undo = () => {
    const indexesToShow = this.undoRedoStack.getCurrent();
    if (indexesToShow) {
      indexesToShow.forEach((index) => {
        this.meshes[index].visible = true;
        this.pickingMeshes[index].visible = true;
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
        this.meshes[index].visible = false;
        this.pickingMeshes[index].visible = false;
      });

      this.renderer.render();
    }
  };
}
