import * as THREE from "three";

/**
 * This class is made for rendering a screen aligned quad.
 */
export class ScreenAlignedQuad extends THREE.Mesh {
  private static quadGeometry = new THREE.PlaneGeometry(1, 1);

  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 100);

  public static forTexture(texture: THREE.Texture) {
    return new this(new THREE.MeshBasicMaterial({ map: texture }));
  }

  constructor(material: THREE.Material) {
    super(ScreenAlignedQuad.quadGeometry, material);

    this.scene.add(this);
    this.position.z = -10;
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
}

export default ScreenAlignedQuad;
