/* eslint-disable max-classes-per-file */
import { color as c, IEditor } from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import {
  nodeFragmentShader,
  nodeVertexShader,
  autoSegNodeFragmentShader,
  autoSegNodeVertexShader,
} from "../../shaders";
import { node, nodeDown, nodeSmall, nodeUp, nodeUpDown } from "./node-icons";

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
  public static readonly minAbsolutePointSize = 10;
  public static readonly pointSizeZoomScale = 5;

  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super({
      vertexShader: nodeVertexShader,
      fragmentShader: nodeFragmentShader,
      uniforms: {
        uPointSize: { value: 1 },
        uNodeTextures: { value: [] },
        uInvertRGB: { value: true },
      },
      transparent: true,
    });

    const loader = new THREE.TextureLoader();
    this.uniforms.uNodeTextures.value = [
      loader.load(node, () => editor.sliceRenderer?.lazyRender()),
      loader.load(nodeDown, () => editor.sliceRenderer?.lazyRender()),
      loader.load(nodeUp, () => editor.sliceRenderer?.lazyRender()),
      loader.load(nodeUpDown, () => editor.sliceRenderer?.lazyRender()),
    ];

    this.disposers.push(
      autorun(() => {
        this.uniforms.uInvertRGB.value = editor.colorMode === "light";
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uPointSize.value =
          Math.max(
            (editor.activeDocument?.viewport2D.zoomLevel ?? 1) *
              OverlayRoundedPointsMaterial.pointSizeZoomScale,
            OverlayRoundedPointsMaterial.minAbsolutePointSize,
          ) * window.devicePixelRatio;
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}

export class OverlayAutoSegPointsMaterial extends THREE.ShaderMaterial {
  public static readonly minAbsolutePointSize = 10;
  public static readonly pointSizeZoomScale = 5;

  private disposers: IDisposer[] = [];

  constructor(editor: IEditor) {
    super({
      vertexShader: autoSegNodeVertexShader,
      fragmentShader: autoSegNodeFragmentShader,
      uniforms: {
        uPointSize: { value: 1 },
        uNodeTexture: { value: null },
        uForegroundColor: { value: null },
        uBackgroundColor: { value: null },
      },
      transparent: true,
    });

    const loader = new THREE.TextureLoader();
    this.uniforms.uNodeTexture.value = loader.load(nodeSmall, () =>
      editor.sliceRenderer?.lazyRender(),
    );
    const green = new THREE.Color(c("green")({ theme: editor.theme }));
    const red = new THREE.Color(c("red")({ theme: editor.theme }));
    this.uniforms.uForegroundColor.value = green;
    this.uniforms.uBackgroundColor.value = red;

    this.disposers.push(
      autorun(() => {
        this.uniforms.uPointSize.value =
          Math.max(
            (editor.activeDocument?.viewport2D.zoomLevel ?? 1) *
              OverlayRoundedPointsMaterial.pointSizeZoomScale,
            OverlayRoundedPointsMaterial.minAbsolutePointSize,
          ) * window.devicePixelRatio;
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }
}
