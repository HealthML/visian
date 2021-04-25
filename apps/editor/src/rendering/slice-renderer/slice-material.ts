import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import { sliceFragmentShader } from "../shaders";
import vertexShader from "../shaders/slice.vert.glsl";
import { getOrder } from "./utils";

import type { Editor } from "../../models";
export abstract class SliceMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
  protected disposers: IDisposer[] = [];

  private image?: RenderedImage;

  constructor(
    private editor: Editor,
    private viewType: ViewType,
    defines = {},
    uniforms = {},
  ) {
    super({
      defines,
      vertexShader,
      fragmentShader: sliceFragmentShader,
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
      side: THREE.DoubleSide,
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
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(this.updateTexture),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  /** Updates the rendered atlas. */
  public setImage(image: RenderedImage) {
    this.uniforms.uVoxelCount.value = image.voxelCount;
    this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
    this.uniforms.uComponents.value = image.voxelComponents;
    this.image = image;
    this.updateTexture();
  }

  private updateTexture = () => {
    const canvasIndex = getOrder(this.editor.viewSettings.mainViewType).indexOf(
      this.viewType,
    );
    this.uniforms.uDataTexture.value = this.image?.getTexture(canvasIndex);
  };
}

export default SliceMaterial;

export class ImageSliceMaterial extends SliceMaterial {
  constructor(editor: Editor, viewType: ViewType) {
    super(
      editor,
      viewType,
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
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uBrightness.value = editor.viewSettings.brightness;
        editor.sliceRenderer?.lazyRender();
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
  constructor(editor: Editor, viewType: ViewType) {
    super(
      editor,
      viewType,
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
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uAnnotationOpacity.value =
          editor.viewSettings.annotationOpacity;
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }
}
