import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class BoundingBox extends THREE.Box3Helper implements IDisposable {
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(),
        new THREE.Vector3().setScalar(1),
      ),
      new THREE.Color("gray"),
    );

    this.disposers.push(
      autorun(() => {
        this.visible =
          editor.activeDocument?.tools.activeTool?.name === "plane-tool";

        editor.volumeRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer());
  }
}
