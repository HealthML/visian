import * as THREE from "three";

import { ViewType } from "../types";

export const getCameraOctant = (cameraPosition: THREE.Vector3) => {
  const { x, y, z } = cameraPosition;

  let cameraOctant = 0;
  if (x > 0) cameraOctant |= 1;
  if (y > 0) cameraOctant |= 2;
  if (z > 0) cameraOctant |= 4;

  return cameraOctant;
};

export const getOctantPlanes = (octantId: number, sprites: THREE.Mesh[][]) => {
  switch (octantId) {
    case 0:
      return [
        sprites[ViewType.Transverse][0],
        sprites[ViewType.Sagittal][1],
        sprites[ViewType.Coronal][0],
      ];
    case 1:
      return [
        sprites[ViewType.Transverse][1],
        sprites[ViewType.Sagittal][1],
        sprites[ViewType.Coronal][1],
      ];
    case 2:
      return [
        sprites[ViewType.Transverse][2],
        sprites[ViewType.Sagittal][0],
        sprites[ViewType.Coronal][0],
      ];
    case 3:
      return [
        sprites[ViewType.Transverse][3],
        sprites[ViewType.Sagittal][0],
        sprites[ViewType.Coronal][1],
      ];
    case 4:
      return [
        sprites[ViewType.Transverse][0],
        sprites[ViewType.Sagittal][3],
        sprites[ViewType.Coronal][2],
      ];
    case 5:
      return [
        sprites[ViewType.Transverse][1],
        sprites[ViewType.Sagittal][3],
        sprites[ViewType.Coronal][3],
      ];
    case 6:
      return [
        sprites[ViewType.Transverse][2],
        sprites[ViewType.Sagittal][2],
        sprites[ViewType.Coronal][2],
      ];
    case 7:
      return [
        sprites[ViewType.Transverse][3],
        sprites[ViewType.Sagittal][2],
        sprites[ViewType.Coronal][3],
      ];
  }
  return [];
};
