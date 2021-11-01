import { IDisposable } from "@visian/utils";
import * as THREE from "three";

/**
 * This class is made for rendering a screen aligned quad.
 */
export class ScreenAlignedQuad extends THREE.Mesh implements IDisposable {
  private static quadGeometry = new THREE.PlaneGeometry(1, 1);

  public static forTexture(texture: THREE.Texture) {
    return new this(new THREE.MeshBasicMaterial({ map: texture }));
  }

  public readonly scene = new THREE.Scene();
  public readonly camera = new THREE.OrthographicCamera(
    -0.5,
    0.5,
    0.5,
    -0.5,
    1,
    100,
  );

  constructor(material?: THREE.Material | THREE.Material[]) {
    super(ScreenAlignedQuad.quadGeometry, material);

    this.scene.add(this);
    this.position.z = -10;
  }

  public dispose() {
    if (Array.isArray(this.material)) {
      this.material.forEach((material) => material.dispose());
    } else {
      this.material.dispose();
    }
  }

  /** Render this quad with the given @param renderer. */
  public renderWith(
    renderer: THREE.WebGLRenderer,
    cameraOffset?: {
      fullWidth: number;
      fullHeight: number;
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) {
    if (cameraOffset) {
      this.camera.setViewOffset(
        cameraOffset.fullWidth,
        cameraOffset.fullHeight,
        cameraOffset.x,
        cameraOffset.y,
        cameraOffset.width,
        cameraOffset.height,
      );
    }

    renderer.render(this.scene, this.camera);

    if (cameraOffset) {
      this.camera.clearViewOffset();
    }
  }

  public compileWith(renderer: THREE.WebGLRenderer) {
    renderer.compile(this.scene, this.camera);
  }
}

export default ScreenAlignedQuad;
