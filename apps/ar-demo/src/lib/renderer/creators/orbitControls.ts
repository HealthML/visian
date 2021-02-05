import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const createOrbitControls = (
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  target: THREE.Vector3,
) => {
  const controls = new OrbitControls(camera, canvas.parentElement!);
  controls.enableKeys = false;

  controls.target = target;

  return controls;
};

export default createOrbitControls;
