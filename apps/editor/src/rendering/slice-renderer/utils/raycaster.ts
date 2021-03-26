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
  public getIntersectionsFromPointer(screenPosition: { x: number; y: number }) {
    const clickedCanvas = [...this.canvases].reverse().find((canvas) => {
      const boundingBox = canvas.getBoundingClientRect();
      return (
        screenPosition.x >= boundingBox.left &&
        screenPosition.x <= boundingBox.right &&
        screenPosition.y >= boundingBox.top &&
        screenPosition.y <= boundingBox.bottom
      );
    });
    if (!clickedCanvas) return [];

    const canvasRect = clickedCanvas.getBoundingClientRect();
    const canvasPosition = {
      x: screenPosition.x - canvasRect.left,
      y: screenPosition.y - canvasRect.top,
    };

    return this.getIntersections(canvasPosition, clickedCanvas);
  }

  /** Returns all intersections with a ray fired at the given position in the canvas. */
  private getIntersections(
    position: { x: number; y: number },
    canvas: HTMLCanvasElement,
  ) {
    const webGLPosition = convertPositionToWebGLPosition(
      position,
      canvas.getBoundingClientRect(),
    );

    const canvasIndex = this.canvases.indexOf(canvas);
    const viewType = getOrder(this.editor.viewSettings.mainViewType)[
      canvasIndex
    ];

    const camera = this.cameras[canvasIndex ? 1 : 0];
    this.raycaster.setFromCamera(webGLPosition, camera);
    return this.raycaster.intersectObjects([this.meshes[viewType]]);
  }
}

export default Raycaster;
