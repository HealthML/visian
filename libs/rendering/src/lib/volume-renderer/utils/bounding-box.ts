import { IConeTransferFunction, IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun, reaction } from "mobx";
import * as THREE from "three";

export class BoundingBox extends THREE.Box3Helper implements IDisposable {
  private disposers: IDisposer[] = [];

  private timeout?: NodeJS.Timeout;

  constructor(private editor: IEditor) {
    super(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(),
        new THREE.Vector3().setScalar(1),
      ),
      new THREE.Color("gray"),
    );

    this.disposers.push(
      autorun(this.updateVisibility),
      reaction(
        () =>
          editor.activeDocument?.viewport3D.activeTransferFunction?.name ===
            "fc-cone" &&
          (editor.activeDocument?.viewport3D.activeTransferFunction as
            | IConeTransferFunction
            | undefined)?.coneDirection.toArray(),
        this.show,
      ),
    );
  }

  private updateVisibility = () => {
    this.visible =
      this.editor.activeDocument?.tools.activeTool?.name === "plane-tool";

    this.editor.volumeRenderer?.lazyRender();
  };

  private show = () => {
    this.visible = true;

    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      this.updateVisibility();
    }, 100);

    this.editor.volumeRenderer?.lazyRender();
  };

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
