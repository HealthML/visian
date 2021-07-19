import * as THREE from "three";
import { MergeFunction } from "../../types";

export interface SliceScene extends THREE.Scene {
  setOverrideTexture(texture?: THREE.Texture): void;
  setMergeFunction(mergeFunction: MergeFunction): void;
}
