import { IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { HeatMapMaterial } from "./heat-map-material";

export class HeatMap extends THREE.Mesh implements IDisposable {
  private disposers: IDisposer[] = [];

  constructor(
    editor: IEditor,
    viewType: ViewType,
    geometry: THREE.BufferGeometry,
  ) {
    super(geometry, new HeatMapMaterial(editor, viewType));

    this.disposers.push(
      autorun(() => {
        this.visible = Boolean(editor.activeDocument?.trackingData);
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    this.disposers.forEach((disposer) => disposer);
    (this.material as HeatMapMaterial).dispose();
  }
}
