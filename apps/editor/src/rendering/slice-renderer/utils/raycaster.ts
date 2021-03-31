import * as THREE from "three";

import { Editor } from "../../../models";
import { convertPositionToWebGLPosition } from "./conversion";
import { getOrder } from "./view-layout";

export class Raycaster {
  private raycaster = new THREE.Raycaster();

  constructor(
    private canvases: HTMLCanvasElement[],
    private cameras: THREE.Camera[],
    private meshes: THREE.Mesh[],
    private editor: Editor,
  ) {}

  /** Returns all intersections with a ray fired at the given screen space position. */
  public getIntersectionsFromPointer(
    screenPosition: { x: number; y: number },
    canvasId = "mainView",
  ) {
    let clickedCanvasIndex: number;
    switch (canvasId) {
      case "upperSideView":
        clickedCanvasIndex = 1;
        break;
      case "lowerSideView":
        clickedCanvasIndex = 2;
        break;
      default:
        clickedCanvasIndex = 0;
        break;
    }

    const canvasRect = this.canvases[
      clickedCanvasIndex
    ].getBoundingClientRect();
    const canvasPosition = {
      x: screenPosition.x - canvasRect.left,
      y: screenPosition.y - canvasRect.top,
    };

    return this.getIntersections(canvasPosition, clickedCanvasIndex);
  }

  /** Returns all intersections with a ray fired at the given position in the canvas. */
  private getIntersections(
    position: { x: number; y: number },
    canvasIndex: number,
  ) {
    const webGLPosition = convertPositionToWebGLPosition(
      position,
      this.canvases[canvasIndex].getBoundingClientRect(),
    );

    const viewType = getOrder(this.editor.viewSettings.mainViewType)[
      canvasIndex
    ];

    const camera = this.cameras[canvasIndex ? 1 : 0];
    this.raycaster.setFromCamera(webGLPosition, camera);
    return this.raycaster.intersectObjects([this.meshes[viewType]]);
  }
}

export default Raycaster;
