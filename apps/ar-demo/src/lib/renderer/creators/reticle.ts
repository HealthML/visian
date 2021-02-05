import * as THREE from "three";

const createReticle = () => {
  const reticle = new THREE.Mesh(
    new THREE.RingBufferGeometry(0.05, 0.06, 100).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3 }),
  );
  reticle.matrixAutoUpdate = false;

  return reticle;
};

export default createReticle;
