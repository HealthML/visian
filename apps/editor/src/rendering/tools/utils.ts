import { DragPoint } from "./types";

export const dragPointsEqual = (dp1: DragPoint, dp2: DragPoint) =>
  dp1.x === dp2.x &&
  dp1.y === dp2.y &&
  dp1.z === dp2.z &&
  dp1.right === dp2.right &&
  dp1.bottom === dp2.bottom;
