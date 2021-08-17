import { color, IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

export class OverlayMaterial extends THREE.LineBasicMaterial {
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor, parameters?: THREE.LineBasicMaterialParameters) {
    super(parameters);

    this.disposers.push(
      autorun(() => {
        this.color.set(color("foreground")({ theme: editor.theme }));

        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
