import * as THREE from "three";

export const getSplitPlane = (material: THREE.ShaderMaterial) => {
  const geometries = [
    new THREE.PlaneGeometry(1, 1),
    new THREE.PlaneGeometry(1, 1),
    new THREE.PlaneGeometry(1, 1),
    new THREE.PlaneGeometry(1, 1),
  ];

  /*
   * Sprite part positioning:
   * 2 | 3
   * --+--
   * 0 | 1
   */
  geometries[0].translate(-0.5, -0.5, 0);
  geometries[1].translate(0.5, -0.5, 0);
  geometries[2].translate(-0.5, 0.5, 0);
  geometries[3].translate(0.5, 0.5, 0);

  return geometries.map((geometry) => new THREE.Mesh(geometry, material));
};
