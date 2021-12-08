import { circleFragmentShader, circleVertexShader } from "@visian/rendering";
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

export class OverlayRoundedPointsMaterial extends THREE.ShaderMaterial {
  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super({
      vertexShader: circleVertexShader,
      fragmentShader: circleFragmentShader,
      uniforms: {
        uPointSize: { value: 20 },
        uColor: { value: new THREE.Color() },
      },
      defines: {
        POINTS: "",
        COLOR: "",
      },
    });

    this.disposers.push(
      autorun(() => updateOverlayColor(this.uniforms.uColor.value, editor)),
      autorun(() => {
        this.uniforms.uPointSize.value = Math.max(
          (editor.activeDocument?.viewport2D.zoomLevel ?? 1) * 8,
          12,
        );
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
