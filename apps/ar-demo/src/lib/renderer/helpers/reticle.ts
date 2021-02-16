import * as THREE from "three";

export default class Reticle extends THREE.Mesh {
  private hitTestSourceRequested = false;
  private hitTestSource: THREE.XRHitTestSource | null = null;

  public active = false;

  constructor(private renderer: THREE.WebGLRenderer) {
    super(
      new THREE.RingBufferGeometry(0.05, 0.06, 100).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.3,
      }),
    );
    this.matrixAutoUpdate = false;
    this.visible = false;
  }

  public activate = (active = true) => {
    this.active = active;
  };

  public hide = () => {
    this.activate(false);
    this.visible = false;
  };

  public update = (frame: THREE.XRFrame) => {
    if (!this.active) return;

    if (!this.hitTestSourceRequested) {
      const session = this.renderer.xr.getSession();
      session
        .requestReferenceSpace("viewer")
        .then((referenceSpace) => {
          session
            .requestHitTestSource({ space: referenceSpace })
            .then((source) => {
              this.hitTestSource = source;
            })
            .catch((e) => {
              console.error(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });

      session.addEventListener("end", () => {
        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
      });

      this.hitTestSourceRequested = true;
    }

    if (this.hitTestSource) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);

      if (hitTestResults.length) {
        const hit = hitTestResults[0];

        const pose = hit.getPose(referenceSpace);

        if (pose) {
          this.visible = true;
          this.matrix.fromArray(pose.transform.matrix);
        } else {
          this.visible = false;
        }
      } else {
        this.visible = false;
      }
    }
  };
}
