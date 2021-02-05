import * as THREE from "three";

import { ClickPosition, Pixel } from "../types";
import { convertPositionToWebGLPosition } from "./conversion";

const raycaster = new THREE.Raycaster();

export const applyVertexColor = (
  geometry: THREE.BufferGeometry,
  color: THREE.Color,
) => {
  const { position } = geometry.attributes;
  const colors = [];

  for (let i = 0; i < position.count; i++) {
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
};

export const getIntersections = (
  webGLPosition: Pixel,
  objects: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
) => {
  raycaster.setFromCamera(webGLPosition, camera);
  return raycaster.intersectObjects(objects);
};

export const getIntersectionsFromPointer = (
  screenPosition: Pixel,
  objects: THREE.Object3D[],
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
) => {
  const canvasRect = canvas.getBoundingClientRect();
  if (
    screenPosition.x <= canvasRect.left ||
    screenPosition.x >= canvasRect.right ||
    screenPosition.y <= canvasRect.top ||
    screenPosition.y >= canvasRect.bottom
  )
    return [];

  const canvasPosition = {
    x: screenPosition.x - canvasRect.left,
    y: screenPosition.y - canvasRect.top,
  };
  const webGLPosition = convertPositionToWebGLPosition(
    canvasPosition,
    canvasRect,
  );

  return getIntersections(webGLPosition, objects, camera);
};

export const getIntersectionsFromClickPosition = (
  clickPosition: ClickPosition,
  objects: THREE.Object3D[],
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  pointerLocked: boolean,
) => {
  return pointerLocked
    ? getIntersections({ x: 0, y: 0 }, objects, camera)
    : getIntersectionsFromPointer(
        {
          x: clickPosition.clientX,
          y: clickPosition.clientY,
        },
        objects,
        canvas,
        camera,
      );
};
