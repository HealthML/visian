import { color as c, IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

const updateOverlayColor = (color: THREE.Color, editor: IEditor) => {
  color.set(c("foreground")({ theme: editor.theme }));

  editor.sliceRenderer?.lazyRender();
};

export class OverlayLineMaterial extends THREE.LineBasicMaterial {
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor, parameters?: THREE.LineBasicMaterialParameters) {
    super(parameters);

    this.disposers.push(autorun(() => updateOverlayColor(this.color, editor)));
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export class OverlayPointsMaterial extends THREE.PointsMaterial {
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor, parameters?: THREE.PointsMaterialParameters) {
    super(parameters ?? { size: 2 });

    this.disposers.push(autorun(() => updateOverlayColor(this.color, editor)));
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
