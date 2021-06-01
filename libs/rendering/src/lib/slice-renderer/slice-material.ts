import { color, IEditor } from "@visian/ui-shared";
import { IDisposable, IDisposer, ViewType } from "@visian/utils";
import { autorun } from "mobx";
import * as THREE from "three";

import { RenderedImage } from "../rendered-image";
import { sliceFragmentShader, sliceVertexShader } from "../shaders";
import { getOrder } from "./utils";

export abstract class SliceMaterial
  extends THREE.ShaderMaterial
  implements IDisposable {
  protected disposers: IDisposer[] = [];

  private image?: RenderedImage;

  constructor(
    private editor: IEditor,
    private viewType: ViewType,
    defines = {},
    uniforms = {},
  ) {
    super({
      defines,
      vertexShader: sliceVertexShader,
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
        this.uniforms.uActiveSlices.value = editor.activeDocument?.viewSettings.selectedVoxel.toArray();
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(this.updateTexture),
    );
  }

  public dispose() {
    super.dispose();
    this.disposers.forEach((disposer) => disposer());
  }

  /** Updates the rendered image. */
  public setImage(image: RenderedImage) {
    this.uniforms.uVoxelCount.value = image.voxelCount;
    this.uniforms.uAtlasGrid.value = image.getAtlasGrid();
    this.uniforms.uComponents.value = image.voxelComponents;
    this.image = image;
    this.updateTexture();
  }

  private updateTexture = () => {
    if (!this.editor.activeDocument) return;

    const canvasIndex = getOrder(
      this.editor.activeDocument.viewport2D.mainViewType,
    ).indexOf(this.viewType);
    this.uniforms.uDataTexture.value = this.image?.getTexture(canvasIndex);
  };
}

export default SliceMaterial;

export class ImageSliceMaterial extends SliceMaterial {
  constructor(editor: IEditor, viewType: ViewType) {
    super(
      editor,
      viewType,
      { IMAGE: "" },
      {
        uContrast: { value: editor.activeDocument?.viewSettings.contrast },
        uBrightness: { value: editor.activeDocument?.viewSettings.brightness },
        uForegroundColor: { value: new THREE.Color("white") },
      },
    );

    this.disposers.push(
      autorun(() => {
        this.uniforms.uContrast.value =
          editor.activeDocument?.viewSettings.contrast;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        this.uniforms.uBrightness.value =
          editor.activeDocument?.viewSettings.brightness;
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        if (!editor.activeDocument || editor.activeDocument.layers.length < 2) {
          return;
        }
        (this.uniforms.uForegroundColor.value as THREE.Color).set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color((editor.activeDocument.layers[1].color as any) || "foreground")(
            {
              theme: editor.theme,
            },
          ),
        );
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }
}

export class AnnotationSliceMaterial extends SliceMaterial {
  constructor(editor: IEditor, viewType: ViewType) {
    super(
      editor,
      viewType,
      { ANNOTATION: "" },
      {
        uAnnotationColor: { value: new THREE.Color("white") },
        uAnnotationOpacity: { value: 0.5 },
      },
    );

    this.disposers.push(
      autorun(() => {
        if (!editor.activeDocument || editor.activeDocument.layers.length < 1) {
          return;
        }

        (this.uniforms.uAnnotationColor.value as THREE.Color).set(
          color(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor.activeDocument?.layers[0].color as any) || "foreground",
          )({
            theme: editor.theme,
          }),
        );
        editor.sliceRenderer?.lazyRender();
      }),
      autorun(() => {
        if (!editor.activeDocument || !editor.activeDocument.layers.length) {
          return;
        }

        this.uniforms.uAnnotationOpacity.value =
          editor.activeDocument?.layers[0].opacity;
        editor.sliceRenderer?.lazyRender();
      }),
    );
  }
}
