import * as THREE from "three";

import { Voxel } from "../../types";

export const createMeshes = (geometries: THREE.BufferGeometry[]) => {
  const material = new THREE.MeshPhongMaterial({
    color: "red",
    side: THREE.DoubleSide,
  });
  return geometries.map((geometry, index) => {
    const meshMaterial = material.clone();

    const mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.userData.index = index;
    return mesh;
  });
};

export const getMaterials = (meshes: THREE.Mesh[]) =>
  meshes.map((mesh) => mesh.material as THREE.MeshPhongMaterial);

export const createScanContainer = () => {
  const meshGroup = new THREE.Group();
  meshGroup.rotateX(Math.PI / -2);
  meshGroup.rotateZ(Math.PI);
  meshGroup.updateMatrix();
  meshGroup.updateMatrixWorld();
  return meshGroup;
};

export const createScanOffsetGroup = (scanSize: Voxel) => {
  const scanOffsetGroup = new THREE.Group();
  scanOffsetGroup.translateX(-scanSize.x / 2);
  scanOffsetGroup.translateY(-scanSize.y / 2);
  return scanOffsetGroup;
};
