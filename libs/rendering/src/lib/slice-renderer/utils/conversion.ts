import { Pixel } from "@visian/utils";

import type * as THREE from "three";

export const getWebGLSizeFromCamera = (camera: THREE.OrthographicCamera) => ({
  x: camera.right - camera.left,
  y: camera.top - camera.bottom,
});

/**
 * Returns a normalized position in the WebGL screen coordinate system.
 *
 * x and y are normalized in [-1.0, 1.0].
 *
 * @param position Click coordinates in the bounding box.
 * @param boxDimensions Size of the bounding box.
 */
export const convertPositionToWebGLPosition = (
  position: Pixel,
  boxDimensions: { width: number; height: number },
) => ({
  x: (2 * position.x) / boxDimensions.width - 1,
  y: (-2 * position.y) / boxDimensions.height + 1,
});
