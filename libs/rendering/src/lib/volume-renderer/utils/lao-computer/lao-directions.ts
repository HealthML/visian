import { PerformanceMode } from "@visian/ui-shared";
import * as THREE from "three";

import { SubdividedOctahedron } from "./subdivided-octahedron";

export const getLAODirections = (amount: number) => {
  const directions: THREE.Vector3[] = [];

  const subdividedOctahedron = new SubdividedOctahedron();

  for (let i = 0; i < amount; i++) {
    directions.push(subdividedOctahedron.getSubdivisionPoint(i));
  }

  return directions;
};

export const encodeSigns = (vector: THREE.Vector3) => {
  let ret = 0;
  if (vector.x > 0) ret += 128;
  if (vector.y > 0) ret += 64;
  if (vector.z > 0) ret += 32;
  return ret;
};

export const getLAODirectionTexture = (amount: number) => {
  const directions = getLAODirections(amount);

  const data = new Uint8Array(amount * 4);

  for (let i = 0; i < directions.length; i++) {
    const direction = directions[i];

    const stride = i * 4;

    data[stride + 0] = Math.abs(direction.x) * 255;
    data[stride + 1] = Math.abs(direction.y) * 255;
    data[stride + 2] = Math.abs(direction.z) * 255;
    data[stride + 3] = encodeSigns(direction);
  }

  return new THREE.DataTexture(data, amount, 1, THREE.RGBAFormat);
};

export const getTotalLAODirections = (mode: PerformanceMode) =>
  mode === "low" ? 8 : 32;
