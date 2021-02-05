import * as THREE from "three";

import { applyVertexColor } from "../../utils";

const createPickingMeshes = (geometries: THREE.BufferGeometry[]) => {
  const pickingMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  const color = new THREE.Color();

  return geometries.map((geometry, index) => {
    const pickingGeometry = geometry.clone();
    applyVertexColor(pickingGeometry, color.setHex(index + 1));
    return new THREE.Mesh(pickingGeometry, pickingMaterial);
  });
};

export default createPickingMeshes;
