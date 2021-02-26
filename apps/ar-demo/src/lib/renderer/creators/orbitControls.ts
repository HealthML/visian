import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const createOrbitControls = (
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  target: THREE.Vector3,
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const controls = new OrbitControls(camera, canvas.parentElement!);
  controls.enableKeys = false;

  controls.target = target;

  return controls;
};

export default createOrbitControls;
