import { color as c, IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";
import { nodeFragmentShader, nodeVertexShader } from "../../shaders";
import { node } from "./node-icons";

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
      vertexShader: nodeVertexShader,
      fragmentShader: nodeFragmentShader,
      uniforms: {
        uPointSize: { value: 20 },
        uNodeTexture: { value: null },
        uInvertRGB: { value: true },
      },
      transparent: true,
    });

    const loader = new THREE.TextureLoader();
    this.uniforms.uNodeTexture.value = loader.load(node, () =>
      editor.sliceRenderer?.lazyRender(),
    );

    this.disposers.push(
      autorun(() => {
        this.uniforms.uInvertRGB.value = editor.colorMode === "light";
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uPointSize.value = Math.max(
          (editor.activeDocument?.viewport2D.zoomLevel ?? 1) * 7,
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
