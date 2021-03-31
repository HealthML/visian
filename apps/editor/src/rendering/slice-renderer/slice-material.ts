import { IDisposable, IDisposer, TextureAtlas, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import fragmentShader from "./shaders/slice.frag.glsl";
import vertexShader from "./shaders/slice.vert.glsl";

import type { Editor } from "../../models";

export abstract class SliceMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
  protected disposers: IDisposer[] = [];

  constructor(
    editor: Editor,
    viewType: ViewType,
    render: () => void,
    defines = {},
    uniforms = {},
  ) {
    super({
      defines,
      vertexShader,
      fragmentShader,
      uniforms: THREE.UniformsUtils.merge([
        {
          uDataTexture: { value: null },
          uActiveSlices: { value: [0, 0, 0] },
          uVoxelCount: { value: [1, 1, 1] },
          uAtlasGrid: { value: [1, 1] },
          uComponents: { value: 1 },
        },
        uniforms,
      ]),
      transparent: true,
    });

    switch (viewType) {
      case ViewType.Transverse:
        this.defines.TRANSVERSE = "";
        break;
      case ViewType.Sagittal:
        this.defines.SAGITTAL = "";
        break;
      case ViewType.Coronal:
        this.defines.CORONAL = "";
        break;
    }

    this.disposers.push(
      autorun(() => {
        this.uniforms.uActiveSlices.value = editor.viewSettings.selectedVoxel.toArray();
        render();
      }),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  /** Updates the rendered atlas. */
  public setAtlas(atlas: TextureAtlas) {
    this.uniforms.uDataTexture.value = atlas.getTexture();
    this.uniforms.uVoxelCount.value = atlas.voxelCount;
    this.uniforms.uAtlasGrid.value = atlas.atlasGrid;
    this.uniforms.uComponents.value = atlas.components;
  }
}

export default SliceMaterial;

export class ImageSliceMaterial extends SliceMaterial {
  constructor(editor: Editor, viewType: ViewType, render: () => void) {
    super(
      editor,
      viewType,
      render,
      { IMAGE: "" },
      {
        uContrast: { value: editor.viewSettings.contrast },
        uBrightness: { value: editor.viewSettings.brightness },
        uForegroundColor: { value: new THREE.Color("white") },
      },
    );

    this.disposers.push(
      autorun(() => {
        this.uniforms.uContrast.value = editor.viewSettings.contrast;
        render();
      }),
      autorun(() => {
        this.uniforms.uBrightness.value = editor.viewSettings.brightness;
        render();
      }),
      autorun(() => {
        (this.uniforms.uForegroundColor.value as THREE.Color).set(
          editor.foregroundColor,
        );
      }),
    );
  }
}

export class AnnotationSliceMaterial extends SliceMaterial {
  constructor(editor: Editor, viewType: ViewType, render: () => void) {
    super(
      editor,
      viewType,
      render,
      { ANNOTATION: "" },
      {
        uAnnotationColor: { value: new THREE.Color("red") },
        uAnnotationOpacity: { value: 0.5 },
      },
    );

    this.disposers.push(
      autorun(() => {
        (this.uniforms.uAnnotationColor.value as THREE.Color).set(
          editor.viewSettings.annotationColor,
        );
      }),
      autorun(() => {
        this.uniforms.uAnnotationOpacity.value =
          editor.viewSettings.annotationOpacity;
      }),
    );
  }
}
